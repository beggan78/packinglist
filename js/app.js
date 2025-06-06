// Firebase 11.6.1 SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, getDocs, onSnapshot, updateDoc, deleteDoc, writeBatch, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// --- Initial Data ---
const initialData = {
  "Viktigt (Handbagage)": [
    { text: "Pass (alla fyra)", packed: false },
    { text: "Biljetter & bokningsbekräftelser", packed: false },
    { text: "Europeiska sjukförsäkringskort (EHIC)", packed: false },
    { text: "Plånbok, körkort, kreditkort, Euro", packed: false },
    { text: "Mobiltelefoner och powerbank", packed: false },
    { text: "Laddare till elektronik", packed: false },
  ],
  "Kläder": [
    { text: "T-shirts/linnen", packed: false },
    { text: "Shorts/kjolar", packed: false },
    { text: "Långbyxor för kvällen", packed: false },
    { text: "Finare outfit för middag", packed: false },
    { text: "Kofta/tunnare jacka", packed: false },
    { text: "Underkläder och strumpor", packed: false },
    { text: "Pyjamas", packed: false },
  ],
  "Bad & Strand": [
    { text: "Badkläder (minst 2 per person)", packed: false },
    { text: "Solskyddsfaktor (hög SPF)", packed: false },
    { text: "After sun", packed: false },
    { text: "Solglasögon", packed: false },
    { text: "Keps/Solhatt", packed: false },
    { text: "Simglasögon (Julie & Nicole)", packed: false },
    { text: "Strandväska", packed: false },
  ],
  "Träning": [
    { text: "Träningskläder (shorts, toppar)", packed: false },
    { text: "Träningsskor", packed: false },
    { text: "Padelracketar", packed: false },
    { text: "Padelbollar", packed: false },
    { text: "Vattenflaskor", packed: false },
  ],
  "Hygien & Apotek": [
    { text: "Tandborstar & tandkräm", packed: false },
    { text: "Schampo, balsam, duschtvål", packed: false },
    { text: "Deodorant", packed: false },
    { text: "Reseapotek (plåster, värktabletter)", packed: false },
    { text: "Myggmedel", packed: false },
  ],
  "För Barnen": [
    { text: "Böcker/tidningar", packed: false },
    { text: "Ritblock och pennor", packed: false },
    { text: "Surfplatta + hörlurar", packed: false },
    { text: "Kortlek/resespel", packed: false },
  ]
};

// --- UI Elements ---
const loadingIndicator = document.getElementById('loading-indicator');
const loadingText = document.getElementById('loading-text');
const appContent = document.getElementById('app-content');
const listContainer = document.getElementById('packing-list-container');
const addItemForm = document.getElementById('add-item-form');
const newItemInput = document.getElementById('new-item-input');
const authInfoDiv = document.getElementById('auth-info');
const userIdSpan = document.getElementById('user-id');

// --- Firebase Initialization ---
let app, auth, db, itemsCollection;

try {
  console.log('=% Initializing Firebase with config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'Missing'
  });
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  itemsCollection = collection(db, 'packing_items');
  
  console.log(' Firebase initialized successfully!');
} catch (error) {
  console.error("L Firebase initialization failed:", error);
  loadingIndicator.innerHTML = '<p class="text-red-500">Kunde inte ansluta till databasen. Kontrollera att miljövariablerna är korrekt konfigurerade.</p>';
}

// --- Authentication ---
onAuthStateChanged(auth, user => {
  if (user) {
    console.log(" User is authenticated with UID:", user.uid);
    userIdSpan.textContent = user.uid;
    authInfoDiv.classList.remove('hidden');
    setupRealtimeListener();
  } else {
    console.log("= User is not authenticated. Attempting to sign in...");
    signIn();
  }
});

async function signIn() {
  try {
    await signInAnonymously(auth);
    console.log("<‰ Anonymous sign-in successful!");
  } catch (error) {
    console.error("L Anonymous sign-in failed:", error);
    loadingText.parentElement.innerHTML = '<p class="text-red-500 font-semibold text-center">Autentisering misslyckades. Appen kan inte synkroniseras.<br><br>Kontrollera att: <br>1. Miljövariablerna är korrekt konfigurerade. <br>2. "Anonymous" sign-in är aktiverat i Firebase Authentication. <br>3. Du har skapat en Firestore-databas i "test mode".</p>';
  }
}

// --- Real-time Data Handling ---
let hasCheckedForPopulation = false;

function setupRealtimeListener() {
  onSnapshot(query(itemsCollection), async (snapshot) => {
    if (!hasCheckedForPopulation && snapshot.empty) {
      hasCheckedForPopulation = true;
      console.log("=Ý Snapshot is empty on first load. Populating initial data...");
      await populateInitialData();
      return;
    }

    hasCheckedForPopulation = true;

    const allItems = [];
    snapshot.forEach(doc => {
      allItems.push({ id: doc.id, ...doc.data() });
    });

    allItems.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    renderList(allItems);

    loadingIndicator.classList.add('hidden');
    appContent.classList.remove('hidden');

  }, (error) => {
    console.error("L Error with real-time listener:", error);
    loadingIndicator.classList.remove('hidden');
    appContent.classList.add('hidden');
    loadingText.innerHTML = `<p class="text-red-500 font-semibold text-center">Ett fel uppstod vid hämtning av listan.</p><p class="text-red-400 text-sm mt-1 text-center">Felkod: ${error.code}. Se till att din databas är skapad i "test mode".</p>`;
  });
}

async function populateInitialData() {
  const batch = writeBatch(db);
  let timestamp = Date.now();
  Object.entries(initialData).forEach(([category, items]) => {
    items.forEach(item => {
      const docRef = doc(itemsCollection);
      batch.set(docRef, {
        ...item,
        category: category,
        createdAt: timestamp++
      });
    });
  });
  try {
    await batch.commit();
    console.log(" Initial data populated successfully.");
  } catch(error) {
    console.error("L Failed to populate initial data:", error);
  }
}

// --- UI Rendering ---
function renderList(items) {
  listContainer.innerHTML = '';

  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Övrigt';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categoryOrder = Object.keys(initialData);
  if (itemsByCategory['Övrigt']) {
    categoryOrder.push('Övrigt');
  }

  for(const category of categoryOrder){
    if(itemsByCategory[category]){
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'mb-6';

      const categoryTitle = document.createElement('h3');
      categoryTitle.className = 'text-lg font-semibold text-gray-700 border-b pb-2 mb-3';
      categoryTitle.textContent = category;
      categoryDiv.appendChild(categoryTitle);

      const itemList = document.createElement('ul');
      itemList.className = 'space-y-2';

      itemsByCategory[category].forEach(item => {
        const li = createListItem(item);
        itemList.appendChild(li);
      });

      categoryDiv.appendChild(itemList);
      listContainer.appendChild(categoryDiv);
    }
  }
}

function createListItem(item) {
  const li = document.createElement('li');
  li.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md transition hover:bg-gray-100';
  li.dataset.id = item.id;

  const itemContent = document.createElement('div');
  itemContent.className = 'flex items-center flex-grow';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.packed;
  checkbox.className = 'h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0';
  checkbox.addEventListener('change', () => togglePackedStatus(item.id, checkbox.checked));

  const label = document.createElement('label');
  label.textContent = item.text;
  label.className = `ml-3 text-base item-text ${item.packed ? 'packed' : ''} break-words`;

  label.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    togglePackedStatus(item.id, checkbox.checked);
  });

  itemContent.appendChild(checkbox);
  itemContent.appendChild(label);

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '&times;';
  deleteButton.className = 'text-red-500 font-bold text-2xl leading-none px-2 rounded hover:bg-red-100 ml-2 flex-shrink-0';
  deleteButton.title = 'Ta bort från listan';
  deleteButton.addEventListener('click', () => deleteItem(item.id));

  li.appendChild(itemContent);
  li.appendChild(deleteButton);

  return li;
}

// --- Event Handlers & Firestore Actions ---
addItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = newItemInput.value.trim();
  if (text === '') return;

  newItemInput.disabled = true;
  try {
    await addDoc(itemsCollection, {
      text: text,
      packed: false,
      category: 'Övrigt',
      createdAt: Date.now()
    });
    newItemInput.value = '';
  } catch (error) {
    console.error("Error adding document: ", error);
  } finally {
    newItemInput.disabled = false;
    newItemInput.focus();
  }
});

async function togglePackedStatus(id, newStatus) {
  const itemRef = doc(db, 'packing_items', id);
  try {
    await updateDoc(itemRef, { packed: newStatus });
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

async function deleteItem(id) {
  const itemRef = doc(db, 'packing_items', id);
  try {
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}