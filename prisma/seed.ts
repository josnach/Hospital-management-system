import { PrismaClient, Role } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateRandomColor } from "@/utils";
import { fakerDE as faker } from "@faker-js/faker";
import db from "@/lib/db";


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("Seeding data...");

  // Create 3 staff
 
const staffRoles: Role[] = ["NURSE", "CASHIER", "LAB_TECHNICIAN"];
  for (const role of staffRoles) {
    const mobile = faker.phone.number();

    await prisma.staff.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone: mobile,
        address: faker.location.streetAddress(),
        department: faker.company.name(),
        role,
        status: "ACTIVE",
        colorCode: generateRandomColor(),
      },
    });
  }

  // Create 10 doctors
  const doctors = [];
  for (let i = 0; i < 10; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        specialization: faker.person.jobType(),
        license_number: faker.string.uuid(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        department: faker.company.name(),
        availability_status: "ACTIVE",
        colorCode: generateRandomColor(),
        type: i % 2 === 0 ? "FULL" : "PART",
        working_days: {
          create: [
            { day: "Monday", start_time: "08:00", close_time: "17:00" },
            { day: "Wednesday", start_time: "08:00", close_time: "17:00" },
          ],
        },
      },
    });
    doctors.push(doctor);
  }

  // Create 20 patients
  const patients = [];
  for (let i = 0; i < 20; i++) {
    const patient = await prisma.patient.create({
      data: {
        id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        date_of_birth: faker.date.birthdate(),
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        phone: faker.phone.number(),
        email: faker.internet.email(),
        marital_status: i % 3 === 0 ? "Married" : "Single",
        address: faker.location.streetAddress(),
        emergency_contact_name: faker.person.fullName(),
        emergency_contact_number: faker.phone.number(),
        relation: "Sibling",
        blood_group: i % 4 === 0 ? "O+" : "A+",
        allergies: faker.lorem.words(2),
        medical_conditions: faker.lorem.words(3),
        privacy_consent: true,
        service_consent: true,
        medical_consent: true,
        colorCode: generateRandomColor(),
      },
    });

    patients.push(patient);
  }

  // Create Appointments
  for (let i = 0; i < 20; i++) {
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const patient = patients[Math.floor(Math.random() * patients.length)];

    await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: faker.date.soon(),
        time: "10:00",
        status: i % 4 === 0 ? "PENDING" : "SCHEDULED",
        type: "Checkup",
        reason: faker.lorem.sentence(),
      },
    });
  }

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});



async function main() {
  await db.services.createMany({
    data: [
      { service_name: "Full Blood Count", description: "Standard blood panel", price: 5000 },
      { service_name: "Malaria Test", description: "Rapid diagnostic test", price: 2000 },
      { service_name: "Typhoid Test", description: "Widal test", price: 3000 },
      { service_name: "Urinalysis", description: "Urine test", price: 1500 },
      { service_name: "HIV Test", description: "HIV test", price: 1000 },
      { service_name: "Hepatitis B Test", description: "Hepatitis B test", price: 1500 },
      { service_name: "Hepatitis C Test", description: "Hepatitis C test", price: 2000 },
      { service_name: "X-Ray", description: "X-Ray test", price: 1000 },
      { service_name: "CT Scan", description: "CT Scan test", price: 2000 },
      { service_name: "MRI", description: "MRI test", price: 3000 },
      { service_name: "Ultrasound", description: "Ultrasound test", price: 4000 },
      { service_name: "ECG", description: "ECG test", price: 5000 },
      { service_name: "EEG", description: "EEG test", price: 6000 },
      { service_name: "ECHO", description: "ECHO test", price: 7000 },
      { service_name: "Holter Monitor", description: "Holter Monitor test", price: 8000 },
      { service_name: "Stress Test", description: "Stress test", price: 9000 },
      { service_name: "Allergy Test", description: "Allergy test", price: 10000 },
      { service_name: "Thyroid Test", description: "Thyroid test", price: 11000 },
      { service_name: "Prostate Test", description: "Prostate Test test", price: 12000 },
      { service_name: "Prenatal Test", description: "Prenatal Test test", price: 13000 },
      { service_name: "Postnatal Test", description: "Postnatal Test test", price: 14000 },
      { service_name: "Genetic Test", description: "Genetic Test test", price: 15000 },
      { service_name: "Hormone Test", description: "Hormone Test test", price: 16000 },
      { service_name: "Liver Function Test", description: "Liver Function Test test", price: 17000 },
      { service_name: "Kidney Function Test", description: "Kidney Function Test test", price: 20000 },
      { service_name: "Pregnancy Test", description: "Pregnancy test", price: 23000 },
      { service_name: "Blood Sugar Test", description: "Blood Sugar test", price: 24000 },
      { service_name: "Stool Test", description: "Stool test", price: 25000 },


    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });