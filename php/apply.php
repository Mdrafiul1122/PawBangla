<?php
/**
 * apply.php — Backend handler for the Pet Adoption application form (Apply.html).
 *
 * Receives a POST submission from Apply.html, validates every field server-side,
 * and stores the application. Returns a JSON response to the page.
 *
 * NOTE ON DATABASE:
 * -----------------
 * This project currently has NO database configuration:
 *   - No config file (e.g. config.php / db.php) exists.
 *   - No SQL schema file exists.
 *   - The existing app stores everything in the browser (localStorage).
 * Because a database is not configured, submissions are saved to a JSON data file
 * so the form works out of the box. If you later set up MySQL, replace the
 * store_application() function with an INSERT and configure your DB credentials.
 *
 * The table/columns expected by a future DB match the fields below
 * (see README "Database Tables": adoption_requests).
 */

declare(strict_types=1);

// ---- CORS / response setup ----
// Accept only POST.
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, 'Method not allowed. Please submit the form.');
}

// Read all submitted fields from $_POST.
$name       = trim((string) ($_POST['fName']       ?? ''));
$email      = trim((string) ($_POST['fEmail']      ?? ''));
$phone      = trim((string) ($_POST['fPhone']      ?? ''));
$address    = trim((string) ($_POST['fAddress']    ?? ''));
$petType    = trim((string) ($_POST['fType']       ?? ''));
$experience = trim((string) ($_POST['fExperience'] ?? ''));
$reason     = trim((string) ($_POST['fReason']     ?? ''));
$contact    = trim((string) ($_POST['contact']     ?? ''));
$petId      = trim((string) ($_POST['petId']       ?? ''));
// The checkbox is only present in $_POST when it is checked.
$agree      = isset($_POST['fAgree']);

// ---- Server-side validation (mirrors the client rules in js/apply.js) ----
$errors = [];

if (strlen($name) < 2) {
    $errors['fName'] = 'Please enter your full name.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['fEmail'] = 'Please enter a valid email address.';
}

$phoneDigits = preg_replace('/[\s\-]+/', '', $phone);
if (!preg_match('/^(?:\+8801?[3-9]\d{8}|01[3-9]\d{8})$/', $phoneDigits)) {
    $errors['fPhone'] = 'Enter a valid Bangladesh phone, e.g. +8801XXXXXXXXX.';
}

if (strlen($address) < 5) {
    $errors['fAddress'] = 'Please enter your full address.';
}

$allowedTypes = ['Dog', 'Cat', 'Bird', 'Rabbit'];
if (!in_array($petType, $allowedTypes, true)) {
    $errors['fType'] = 'Please choose a valid pet type.';
}

$allowedExperience = ['None', 'Some', 'Experienced'];
if ($experience === '' || !in_array($experience, $allowedExperience, true)) {
    $errors['fExperience'] = 'Please choose your experience level.';
}

if (strlen($reason) < 20) {
    $errors['fReason'] = 'Please write at least a short reason (20+ characters).';
}

$allowedContact = ['Phone', 'Email'];
if (!in_array($contact, $allowedContact, true)) {
    $errors['contact'] = 'Please choose a preferred contact method.';
}

if (!$agree) {
    $errors['fAgree'] = 'Please agree to the confirmation to continue.';
}

// If any validation failed, return a clear error response.
if (!empty($errors)) {
    respond(422, 'Please fix the highlighted fields and try again.', ['errors' => $errors]);
}

// ---- Build the application record ----
$application = [
    'id'         => 'app_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 6),
    'petId'      => $petId,
    'petType'    => $petType,
    'applicant'  => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    'email'      => $email,
    'phone'      => $phone,
    'address'    => htmlspecialchars($address, ENT_QUOTES, 'UTF-8'),
    'experience' => $experience,
    'reason'     => htmlspecialchars($reason, ENT_QUOTES, 'UTF-8'),
    'contact'    => $contact,
    'date'       => date('d M Y'),
    'status'     => 'Pending',
];

// ---- Save the application ----
try {
    store_application($application);
} catch (Throwable $e) {
    error_log('apply.php save failed: ' . $e->getMessage());
    respond(500, 'Sorry, we could not save your application right now. Please try again later.');
}

// Success.
respond(200, 'Application submitted successfully!', ['application' => $application]);

// =====================================================================
// Storage layer
// =====================================================================

/**
 * Saves an application. Currently persists to a JSON data file because no
 * database is configured. Replace with a DB INSERT when MySQL is available.
 *
 * @param array $application The validated application record.
 * @throws RuntimeException If the data file cannot be written.
 */
function store_application(array $application): void
{
    $dir  = __DIR__ . '/data';
    $file = $dir . '/submissions.json';

    if (!is_dir($dir)) {
        if (!mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException('Could not create data directory.');
        }
    }

    $records = [];
    if (is_file($file)) {
        $raw = (string) file_get_contents($file);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $records = $decoded;
        }
    }

    $records[] = $application;

    $json = json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($file, $json, LOCK_EX) === false) {
        throw new RuntimeException('Could not write application data.');
    }
}

/**
 * Sends a JSON response and stops execution.
 *
 * @param int    $status HTTP status code.
 * @param string $message Human-readable message for the user.
 * @param array  $extra  Extra data merged into the response.
 */
function respond(int $status, string $message, array $extra = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['success' => $status < 400, 'message' => $message], $extra));
    exit;
}
