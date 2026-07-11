export const DEFAULT_PROFILE = {
  city: 'Bengaluru',
  pincode: '560034',
  landmark: 'Koramangala 5th Block',
  travelMode: 'Car',
  travelRoute: 'Koramangala to Whitefield',
  language: 'English',
  housingType: 'Apartment',
} as const;

export const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Kannada', 'Tamil'] as const;

export const HOUSING_TYPE_OPTIONS = ['Apartment', 'Ground-floor home', 'Flood-prone area', 'Rural home'] as const;

export const TRANSPORT_MODE_OPTIONS = ['Walking', 'Bike', 'Car', 'Bus', 'Train'] as const;

export const NEED_OPTIONS = ['medication', 'disability support', 'pregnancy', 'power backup', 'drinking water', 'public transport'] as const;
