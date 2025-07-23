const Locker = require("../entity/locker");
const { connectDB } = require("../service/db");

/**
 * Create and load locker fixtures into the database
 * : npm run fixtures:lockers
 */
async function loadLockerFixtures() {
  try {
    await connectDB();
    await Locker.deleteMany({});

    const lockers = [
      {
        number: "1",
        size: "small",
        state: "available",
        price: 5,
      },
      {
        number: "2",
        size: "small",
        state: "available",
        price: 5,
      },
      {
        number: "3",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "4",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "5",
        size: "large",
        state: "available",
        price: 12,
      },
      {
        number: "6",
        size: "large",
        state: "unavailable",
        price: 12,
      },
      {
        number: "7",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "8",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "9",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "10",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "11",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "12",
        size: "medium",
        state: "available",
        price: 8,
      },
      {
        number: "13",
        size: "medium",
        state: "available",
        price: 8,
      },
    ];

    await Locker.insertMany(lockers);

    return lockers;
  } catch (error) {
    console.error("Erreur lors du chargement des fixtures casiers :", error);
    throw error;
  }
}

if (require.main === module) {
  loadLockerFixtures()
    .then(() => {
      console.log("Fixtures des casiers chargées avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        "Erreur lors du chargement des fixtures des casiers :",
        error
      );
      process.exit(1);
    });
}

module.exports = { loadLockerFixtures };
