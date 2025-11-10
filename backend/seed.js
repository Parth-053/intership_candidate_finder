/*
 * YEH SCRIPT POORE FIREBASE DATABASE KO DELETE KARKE
 * AAPKE .json FILES SE NAYA DATA BHAR DEGI.
 * ISE SIRF EK BAAR CHALAANA HAI.
 */
const { db, auth, admin } = require('./firebase-admin.js'); // .js extension add karein
const fs = require('fs');
const path = require('path');

// Check karein ki user ne '--fresh' flag pass kiya hai
const args = process.argv.slice(2);
const FRESH_SEED = args.includes('--fresh');

// --- DATA FILES KA PATH ---
const candidatesPath = path.join(__dirname, 'data', 'candidates.json');
const recruitersPath = path.join(__dirname, 'data', 'recruiters.json');
const categoriesPath = path.join(__dirname, 'data', 'categories.json');
const internshipsPath = path.join(__dirname, 'data', 'available_internships.json');
const applicationsPath = path.join(__dirname, 'data', 'applications.json');

// --- HELPER FUNCTIONS ---

// JSON file padhne ke liye
function readJson(filePath) {
  console.log(`Reading ${filePath}...`);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Pause lene ke liye
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 'deleteCollection' FUNCTION (Rate Limit ko handle karne ke liye)
async function deleteCollection(collectionName) {
  console.log(`Deleting collection: ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  const batchSize = 500; // Firebase batch ki limit
  
  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    
    if (snapshot.empty) {
      console.log(`Collection ${collectionName} is now empty.`);
      break; 
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${snapshot.size} documents from ${collectionName}.`);
    
    if (snapshot.size === batchSize) {
      console.log('Pausing for 1 second to avoid rate limit...');
      await delay(1000); 
    } else {
      console.log(`Finished deleting ${collectionName}.`);
      break;
    }
  }
}

// Firebase Auth se saare users delete karne ke liye
async function deleteAllUsers() {
  console.log('Deleting all Firebase Auth users...');
  try {
    let users = await auth.listUsers(1000);
    while (users.users.length > 0) {
      const uids = users.users.map(u => u.uid);
      await auth.deleteUsers(uids);
      console.log(`Deleted ${uids.length} users.`);
      users = await auth.listUsers(1000);
    }
    console.log('All users deleted.');
  } catch (error) {
    console.error('Error deleting users (might be empty):', error.message);
    console.log('Continuing with script...');
  }
}

// --- MAIN SEED FUNCTIONS ---

const idMap = {};

async function seedUsers() {
  console.log('Seeding Users...');
  const candidates = readJson(candidatesPath);
  const recruiters = readJson(recruitersPath);

  // Candidates ko Auth mein banayein
  for (const user of candidates) {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`User ${user.email} already exists. Using existing UID.`);
      } catch (e) {
        userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
        });
      }
      
      const newUid = userRecord.uid;
      idMap[user.id] = newUid;
      const { id, password, ...profileData } = user; 
      await db.collection('candidates').doc(newUid).set(profileData); 
    } catch (e) {
      console.error(`Failed to create/update candidate ${user.email}: ${e.message}`);
    }
  }

  // Recruiters ko Auth mein banayein
  for (const user of recruiters) {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`User ${user.email} already exists. Using existing UID.`);
      } catch (e) {
        userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
        });
      }
      
      const newUid = userRecord.uid;
      idMap[user.id] = newUid;
      const { id, password, ...profileData } = user;
      await db.collection('recruiters').doc(newUid).set(profileData);
    } catch (e) {
      console.error(`Failed to create/update recruiter ${user.email}: ${e.message}`);
    }
  }
  console.log('Users seeded successfully.');
  console.log('ID Map created:', idMap);
}

async function seedCategories() {
  console.log('Seeding categories...');
  const categories = readJson(categoriesPath);
  const batch = db.batch();
  for (const category of categories) {
    const docRef = db.collection('categories').doc(); 
    batch.set(docRef, category);
  }
  await batch.commit();
  console.log('Categories seeded successfully.');
}

// ✅ SEED INTERNSHIPS FUNCTION KO UPDATE KIYA GAYA HAI
async function seedInternships() {
  console.log('Seeding internships (in batches)...');
  const internships = readJson(internshipsPath);
  let batch = db.batch();
  let count = 0;

  for (const internship of internships) {
    // Recruiter ID ko map karein
    const oldRecruiterId = internship.recruiterId;
    const newRecruiterUid = idMap[oldRecruiterId];
    
    if (newRecruiterUid) {
      internship.recruiterId = newRecruiterUid;
    } else {
      console.warn(`Warning: Recruiter ID ${oldRecruiterId} for internship ${internship.title} not found in map. Setting to null.`);
      internship.recruiterId = null;
    }

    // ✅ !! YEH HAI FIX !!
    // Agar JSON file mein status field nahi hai, toh use "Active" set karein
    if (!internship.status) {
        internship.status = "Active";
    }
    
    const docRef = db.collection('internships').doc(String(internship.id));
    batch.set(docRef, internship); // 'set' data ko overwrite kar dega
    count++;

    // Har 400 document ke baad batch ko commit karein (Quota error se bachne ke liye)
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`Committed batch of ${count} internships...`);
      batch = db.batch(); // Naya batch banayein
      await delay(1000); // 1 sec pause
    }
  }
  
  // Bacha hua batch commit karein
  if (count % 400 !== 0) {
    await batch.commit();
  }
  console.log(`Internships seeded successfully (${internships.length} total).`);
}


async function seedApplications() {
  console.log('Seeding applications...');
  const applications = readJson(applicationsPath);
  const batch = db.batch();
  for (const app of applications) {
    const oldCandidateId = app.candidateId;
    const oldRecruiterId = app.recruiterId;
    
    const newCandidateUid = idMap[oldCandidateId];
    const newRecruiterUid = idMap[oldRecruiterId];
    
    if (newCandidateUid && newRecruiterUid) {
      app.candidateId = newCandidateUid;
      app.recruiterId = newRecruiterUid;
      const docRef = db.collection('applications').doc(app.id);
      batch.set(docRef, app);
    } else {
      console.warn(`Skipping application ${app.id} due to missing user map.`);
    }
  }
  await batch.commit();
  console.log('Applications seeded successfully.');
}

// --- SCRIPT KO CHALAAYEIN ---
async function main() {
  try {
    console.log('--- STARTING DATABASE SEED ---');
    
    if (FRESH_SEED) {
      console.log('--fresh flag detected. Wiping all data...');
      // 1. Sab kuch delete karein
      await deleteAllUsers();
      console.log('--- Pausing 1s after Auth delete ---');
      await delay(1000); 

      await deleteCollection('candidates');
      console.log('--- Pausing 1s after candidates delete ---');
      await delay(1000); 

      await deleteCollection('recruiters');
      console.log('--- Pausing 1s after recruiters delete ---');
      await delay(1000); 

      await deleteCollection('categories');
      console.log('--- Pausing 1s after categories delete ---');
      await delay(1000); 

      await deleteCollection('internships');
      console.log('--- Pausing 1s after internships delete ---');
      await delay(1000); 
      
      await deleteCollection('applications');
      
      console.log('\n--- Database cleared ---');
      console.log('--- Pausing 2s before seeding new data ---');
      await delay(2000);
    } else {
      console.log('Skipping delete step. Use "npm run seed -- --fresh" to wipe data first.');
    }

    // 2. Naye Users banayein (ya update karein)
    await seedUsers();
    
    // 3. Baaki data daalein (yeh data ko overwrite kar dega)
    if (!FRESH_SEED) {
      console.log('Deleting categories collection before re-seeding...');
      await deleteCollection('categories');
    }
    await seedCategories();
    
    await seedInternships(); // <-- Updated function yahan call hoga
    await seedApplications();
    
    console.log('\n--- DATABASE SEEDING COMPLETE! ---');
    
  } catch (e) {
    console.error('An error occurred during seeding:', e);
  }
}

main();