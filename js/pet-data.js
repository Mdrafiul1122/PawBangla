(function (global) {
  var PETS = [
    {
      id: 'bruno',
      name: 'Bruno',
      type: 'Dog',
      breed: 'Labrador Retriever',
      district: 'Dhaka',
      location: 'Dhaka, Mirpur',
      age: '2 years',
      gender: 'Male',
      compatibility: 94,
      status: 'available',
      img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      description: 'Bruno is a friendly, energetic family dog who loves long walks, playing fetch and belly rubs. He gets along wonderfully with children and other dogs, and is already trained to walk on a leash.',
      temperament: 'Friendly · Energetic · Social',
      traits: ['Good with kids', 'House-trained', 'Vaccinated', 'Neutered'],
      care: ['Daily 45-minute walks', 'Brush coat twice a week', 'High-quality dog food twice a day', 'Plenty of toys to chew']
    },
    {
      id: 'luna',
      name: 'Luna',
      type: 'Cat',
      breed: 'Persian',
      district: 'Chittagong',
      location: 'Chittagong',
      age: '1 year',
      gender: 'Female',
      compatibility: 88,
      status: 'available',
      img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=300&fit=crop',
      description: 'Luna is a calm and affectionate lap cat who thrives in a quiet indoor home. She loves being brushed and will happily follow you from room to room for attention.',
      temperament: 'Calm · Affectionate · Indoor',
      traits: ['Indoor cat', 'Vaccinated', 'Good with cats'],
      care: ['Daily grooming for her long coat', 'Indoor-only lifestyle', 'Fresh water and quality cat food', 'Scratching post recommended']
    },
    {
      id: 'koko',
      name: 'Koko',
      type: 'Bird',
      breed: 'African Grey',
      district: 'Sylhet',
      location: 'Sylhet',
      age: '3 years',
      gender: 'Male',
      compatibility: 76,
      status: 'available',
      img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
      description: 'Koko is a clever and talkative African Grey who loves learning new words and solving puzzles. He needs an experienced owner who can give him daily attention and out-of-cage time.',
      temperament: 'Talkative · Clever · Needs attention',
      traits: ['Vocal', 'Hand-fed', 'Needs space'],
      care: ['Pellets and fresh fruit daily', 'Minimum 2 hours out of cage', 'New puzzle toys regularly', 'Bathing 2-3 times a week']
    },
    {
      id: 'bella',
      name: 'Bella',
      type: 'Rabbit',
      breed: 'Holland Lop',
      district: 'Rajshahi',
      location: 'Rajshahi',
      age: '8 months',
      gender: 'Female',
      compatibility: 91,
      status: 'available',
      img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop',
      description: 'Bella is a gentle, social bunny who loves treats and head scratches. She is litter-trained and gets along great with kids, making her a wonderful first pet.',
      temperament: 'Gentle · Social · Playful',
      traits: ['Litter-trained', 'Good with kids', 'Indoor rabbit'],
      care: ['Unlimited hay', 'Fresh greens daily', 'Indoor play space', 'Regular nail trims']
    },
    {
      id: 'rex',
      name: 'Rex',
      type: 'Dog',
      breed: 'German Shepherd',
      district: 'Dhaka',
      location: 'Dhaka, Banani',
      age: '3 years',
      gender: 'Male',
      compatibility: 82,
      status: 'available',
      img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop',
      description: 'Rex is a loyal and protective German Shepherd looking for an experienced owner with a garden. He is obedience-trained, eager to please and forms a very strong bond with his family.',
      temperament: 'Loyal · Protective · Active',
      traits: ['Guard-trained', 'Vaccinated', 'Needs space'],
      care: ['Daily long walks and play', 'Secure outdoor area', 'Strong leadership and training', 'Regular deworming and check-ups']
    },
    {
      id: 'mia',
      name: 'Mia',
      type: 'Cat',
      breed: 'Domestic Shorthair',
      district: 'Khulna',
      location: 'Khulna',
      age: '6 months',
      gender: 'Female',
      compatibility: 95,
      status: 'adopted',
      img: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop',
      description: 'Mia is a playful kitten with a big personality. She has already found her forever family and is doing wonderfully in her new home.',
      temperament: 'Playful · Curious · Friendly',
      traits: ['Vaccinated', 'Playful', 'Good with families'],
      care: ['Wet and dry kitten food', 'Daily play sessions', 'Kitten-safe toys', 'Litter box kept clean']
    }
  ];

  function getPets() {
    try {
      var v = localStorage.getItem('paw_pets');
      if (v) {
        var arr = JSON.parse(v);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (e) {}
    return PETS;
  }

  function getPet(id) {
    var list = getPets();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  global.PETS = PETS;
  global.getPets = getPets;
  global.getPet = getPet;
})(window);