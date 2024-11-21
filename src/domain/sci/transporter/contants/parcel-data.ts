export const parcel = {
  weight: 2,
  reference: 'test ref',
  insuranceValue: 0,
  items: [
    {
      value: 1,
      description: 'book',
      quantity: 1,
      weight: 1,
      hsCode: 123456,
    },
    {
      value: 1,
      description: 'shoes',
      quantity: 1,
      weight: 1,
      hsCode: 123456,
    },
  ],
};

// const parcel2 = {
//   weight: 2,
//   reference: 'test ref2',
//   insuranceValue: 0,
// };

// export const parcels = [parcel, parcel2, { weight: 3, reference: "ref3" }, {
//   weight: 4,
//   reference: "ref4"
// },
//   { weight: 5, reference: "ref5" }, { weight: 6, reference: "ref6" }];

export const parcels = (() => {
  const arr = [];
  for (let i = 1; i < 3; i++) {
    const a = {
      weight: 1,
      reference: `ref ${i}`,
    };
    arr.push(a);
  }
  return arr;
})();

export const cn23Items = [
  {
    description: 'pull',
    quantity: 3,
    weight: 0.33,
    value: 1,
    originCountry: 'CN',
    hsCode: '10001235',
  },
  {
    description: 'robe',
    quantity: 10,
    weight: 0.33,
    value: 2,
    originCountry: 'CN',
    hsCode: '10001234',
  },
];
