// Run with: npm run seed
// Populates the database with sample hospital accounts so the
// "nearby hospitals" feature has real data to show during development.
// All seeded hospitals use the password: hospital123

require("dotenv").config();
const connectDB = require("../config/db");
const Hospital = require("../models/Hospital");

const sampleHospitals = [
  {
    name: "Sunrise Trauma & General Hospital",
    email: "sunrise.hospital@example.com",
    password: "hospital123",
    phone: "+91-9000000001",
    address: "Sigra, Varanasi, Uttar Pradesh",
    location: { type: "Point", coordinates: [82.9913, 25.3050] },
    totalBeds: 120,
    availableBeds: 18,
    facilities: ["Emergency Room", "ICU", "Trauma Center", "Ventilator Support", "Blood Bank", "Ambulance Service", "Operation Theatre", "X-Ray / CT Scan"],
  },
  {
    name: "Ganga Multispeciality Hospital",
    email: "ganga.hospital@example.com",
    password: "hospital123",
    phone: "+91-9000000002",
    address: "Lanka, Varanasi, Uttar Pradesh",
    location: { type: "Point", coordinates: [83.0040, 25.2700] },
    totalBeds: 90,
    availableBeds: 4,
    facilities: ["Emergency Room", "ICU", "Cardiac Care", "Operation Theatre", "Pharmacy 24x7", "Blood Bank"],
  },
  {
    name: "City Care Hospital",
    email: "citycare.hospital@example.com",
    password: "hospital123",
    phone: "+91-9000000003",
    address: "Cantonment, Varanasi, Uttar Pradesh",
    location: { type: "Point", coordinates: [83.0083, 25.3320] },
    totalBeds: 60,
    availableBeds: 0,
    facilities: ["Emergency Room", "Pediatric Care", "X-Ray / CT Scan", "Dialysis"],
  },
  {
    name: "Varuna Heights Super Speciality Hospital",
    email: "varunaheights.hospital@example.com",
    password: "hospital123",
    phone: "+91-9000000004",
    address: "Bhelupur, Varanasi, Uttar Pradesh",
    location: { type: "Point", coordinates: [82.9740, 25.2860] },
    totalBeds: 150,
    availableBeds: 32,
    facilities: ["Emergency Room", "ICU", "Trauma Center", "Neurosurgery", "Orthopedics", "Ventilator Support", "Operation Theatre", "Ambulance Service", "Burn Unit"],
  },
  {
    name: "Kashi Govt. District Hospital",
    email: "kashidistrict.hospital@example.com",
    password: "hospital123",
    phone: "+91-9000000005",
    address: "Kabir Chaura, Varanasi, Uttar Pradesh",
    location: { type: "Point", coordinates: [83.0027, 25.3220] },
    totalBeds: 250,
    availableBeds: 55,
    facilities: ["Emergency Room", "ICU", "Trauma Center", "Blood Bank", "Pharmacy 24x7", "Ambulance Service", "X-Ray / CT Scan", "Dialysis", "Pediatric Care"],
  },
  {
    name: "Riverside Orthopedic & Accident Centre",
    email: "riverside.hospital@example.com",
    password: "hospital123",
    phone: "+91-9000000006",
    address: "Assi Ghat, Varanasi, Uttar Pradesh",
    location: { type: "Point", coordinates: [83.0060, 25.2920] },
    totalBeds: 45,
    availableBeds: 9,
    facilities: ["Emergency Room", "Orthopedics", "Operation Theatre", "X-Ray / CT Scan", "Ambulance Service"],
  },
];

const run = async () => {
  await connectDB();

  console.log("Clearing existing hospital records...");
  await Hospital.deleteMany({});

  console.log("Inserting sample hospitals...");
  // Use .create in a loop (not insertMany) so password hashing middleware runs
  for (const data of sampleHospitals) {
    // eslint-disable-next-line no-await-in-loop
    await Hospital.create(data);
    console.log(`  + ${data.name}`);
  }

  console.log(`\nDone. Seeded ${sampleHospitals.length} hospitals.`);
  console.log("Login with any hospital email above and password: hospital123");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
