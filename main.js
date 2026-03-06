const SUPABASE_URL = "https://dcyhvrmyturgzzznzepo.supabase.co";
const SUPABASE_KEY = "sb_publishable_FcZ585fdbWbTtA2O95y_UQ_tJUXNaut";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// TAB LOGIC
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = document.querySelector(tab.dataset.tabTarget);
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    tab.classList.add('active');
    target.classList.add('active');
  });
});

let currentIndex = 0;
let uploadedImages = [];

// main.js - Update loadGallery and add Batch Delete

// main.js - Updated loadGallery to show/hide Select All
async function loadGallery() {
  const { data, error } = await supabaseClient.storage
    .from("gallery")
    .list('', { limit: 1000 });

  const gallery = document.getElementById("galleryContainer");
  const batchBtn = document.getElementById("batchDeleteBtn");
  const selectAllContainer = document.getElementById("selectAllContainer");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");

  if (!gallery || error) return;

  gallery.innerHTML = "";
  uploadedImages = []; 
  batchBtn.style.display = "none";
  selectAllCheckbox.checked = false; // Reset the checkbox

  // Show the "Select All" option only if there are pictures to select
  selectAllContainer.style.display = data.length > 0 ? "block" : "none";

  data.forEach((file, index) => {
    const url = `${SUPABASE_URL}/storage/v1/object/public/gallery/${file.name}`;
    uploadedImages.push(url);

    const wrapper = document.createElement("div");
    wrapper.className = "media-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "select-checkbox";
    checkbox.dataset.filename = file.name;
    checkbox.onclick = (e) => {
      e.stopPropagation();
      wrapper.classList.toggle("selected", checkbox.checked);
      updateBatchDeleteVisibility();
    };

    let element = document.createElement(file.name.match(/\.(mp4|webm|mov)$/i) ? "video" : "img");
    element.src = url;
    element.onclick = () => openUploadedLightbox(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "✕";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = (e) => { e.stopPropagation(); deleteMedia(file.name); };

    wrapper.appendChild(checkbox);
    wrapper.appendChild(element);
    wrapper.appendChild(deleteBtn);
    gallery.appendChild(wrapper);
  });
}

// Logic to toggle every single checkbox at once
function toggleSelectAll() {
  const isChecked = document.getElementById("selectAllCheckbox").checked;
  const allCheckboxes = document.querySelectorAll('.select-checkbox');
  
  allCheckboxes.forEach(cb => {
    cb.checked = isChecked;
    cb.parentElement.classList.toggle("selected", isChecked);
  });
  
  updateBatchDeleteVisibility();
}

// Ensure the Delete button appears correctly
function updateBatchDeleteVisibility() {
  const selected = document.querySelectorAll('.select-checkbox:checked');
  const batchBtn = document.getElementById("batchDeleteBtn");
  batchBtn.style.display = selected.length > 0 ? "inline-block" : "none";
  
  // Update Select All checkbox state if user manually unchecks one item
  const allCheckboxes = document.querySelectorAll('.select-checkbox');
  document.getElementById("selectAllCheckbox").checked = (selected.length === allCheckboxes.length && allCheckboxes.length > 0);
}

// New Batch Delete Function
async function deleteSelectedMedia() {
  const selectedCheckboxes = document.querySelectorAll('.select-checkbox:checked');
  const fileNames = Array.from(selectedCheckboxes).map(cb => cb.dataset.filename);

  if (fileNames.length === 0) return;

  if (!confirm(`Are you sure you want to delete these ${fileNames.length} memories forever?`)) return;

  // Use Supabase .remove() with the array of filenames
  const { error } = await supabaseClient.storage
    .from("gallery")
    .remove(fileNames);

  if (error) {
    alert("Magic failed: Could not delete some files.");
    console.error(error);
  } else {
    loadGallery(); // Refresh the grid
  }
}

async function uploadMedia() {
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;
  const progressContainer = document.getElementById("progressContainer");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  if (files.length === 0) return alert("Please select files first!");

  // Show the progress bar
  progressContainer.style.display = "block";
  progressFill.style.width = "0%";
  
  let uploadedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = Date.now() + "-" + file.name;

    progressText.innerText = `Magic in progress... (${i + 1}/${files.length})`;

    const { error } = await supabaseClient.storage
      .from("gallery")
      .upload(fileName, file);

    if (error) {
      console.error(`Error uploading ${file.name}:`, error);
    } else {
      uploadedCount++;
    }

    // Update the bar percentage
    const percentage = ((i + 1) / files.length) * 100;
    progressFill.style.width = percentage + "%";
  }

  progressText.innerText = "Upload Complete! ✨";
  
  // Hide the bar after 2 seconds and refresh gallery
  setTimeout(() => {
    progressContainer.style.display = "none";
    fileInput.value = "";
    loadGallery();
  }, 2000);
}

async function deleteMedia(fileName) {
  if (!confirm("Delete this magic memory?")) return;
  const { error } = await supabaseClient.storage.from("gallery").remove([fileName]);
  if (!error) loadGallery();
}

function openUploadedLightbox(index) {
  currentIndex = index;
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  lb.style.display = "block"; 
  lbImg.src = uploadedImages[currentIndex];

  document.querySelector(".next").onclick = () => {
    currentIndex = (currentIndex + 1) % uploadedImages.length;
    lbImg.src = uploadedImages[currentIndex];
  };
  document.querySelector(".prev").onclick = () => {
    currentIndex = (currentIndex - 1 + uploadedImages.length) % uploadedImages.length;
    lbImg.src = uploadedImages[currentIndex];
  };
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

function createSparkle(){
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  sparkle.innerHTML = "✨";
  sparkle.style.left = Math.random() * 100 + "vw";
  sparkle.style.animationDuration = (Math.random()*3 + 4) + "s";
  document.querySelector(".sparkle-container").appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 7000);
}
setInterval(createSparkle, 300);

loadGallery();

// Add this to the bottom of main.js if it's not there
async function deleteMedia(fileName) {
  // A quick confirmation so you don't delete by accident!
  if (!confirm("Are you sure you want to delete this magic memory?")) return;

  const { error } = await supabaseClient.storage
    .from("gallery")
    .remove([fileName]);

  if (error) {
    alert("Magic failed: Could not delete.");
    console.error(error);
  } else {
    // This reloads the gallery so the photo disappears instantly
    loadGallery();
  }
}

// main.js - Helper for IG Design

function updateFileCount() {
  const input = document.getElementById('fileInput');
  const labelText = document.querySelector('.custom-file-upload p');
  const count = input.files.length;
  
  if (count > 0) {
    labelText.innerText = `${count} files selected ✨`;
    labelText.style.color = "#ff1493"; // Change to Winx pink when files are ready
  } else {
    labelText.innerText = "Choose Photos/Videos";
    labelText.style.color = "#8e8e8e";
  }
}

// main.js - Helper for IG Design

// Start upload immediately after files are selected
async function autoUpload() {
  const input = document.getElementById('fileInput');
  if (input.files.length === 0) return;
  
  // Call your existing uploadMedia function, but pass the input.files
  await uploadMediaFromAuto(input.files);
}

// Minimalist update to uploadMedia
async function uploadMediaFromAuto(filesToUpload) {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const container = document.getElementById("progressContainer");

  container.style.display = "block";

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    const fileName = Date.now() + "-" + file.name;
    
    // Minimalist text, e.g., "1/5..."
    progressText.innerText = `Adding magic... ${i+1}/${filesToUpload.length}`;
    
    await supabaseClient.storage.from("gallery").upload(fileName, file);
    progressFill.style.width = ((i + 1) / filesToUpload.length * 100) + "%";
  }

  // Clear input and reload gallery
  document.getElementById('fileInput').value = ""; 
  progressText.innerText = "Shared! ✨";
  setTimeout(() => { container.style.display = "none"; loadGallery(); }, 1200);
}

let currentFriend = ""; // Tracks which friend's canvas we are using

// main.js - Drawing Logic
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

function startDrawing(e) {
    painting = true;
    draw(e);
}

function stopDrawing() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = document.getElementById('brushSize').value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = document.getElementById('brushColor').value;

    // Adjust for canvas position
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Open the drawing tool
function openDrawingMode() {
    document.getElementById('drawingModal').style.display = 'flex';
    // Set canvas size to match display
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;
}

function closeDrawing() {
    document.getElementById('drawingModal').style.display = 'none';
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Event Listeners for Drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

// New function to save the doodle to Supabase
async function saveDrawing() {
    const canvas = document.getElementById('paintCanvas');
    
    // 1. Convert canvas to a blob (image file)
    canvas.toBlob(async (blob) => {
        const fileName = `doodle-${Date.now()}.png`;
        const filePath = `gab/${fileName}`; // Saves into the 'gab' folder

        // 2. Upload to Supabase
        const { data, error } = await supabaseClient.storage
            .from("gallery")
            .upload(filePath, blob, {
                contentType: 'image/png'
            });

        if (error) {
            console.error("Save failed:", error);
            alert("Magic failed: Could not save drawing.");
        } else {
            alert("Doodle saved to Gab's Chaos! ✨");
            closeDrawing();
            if (typeof loadGabGallery === "function") {
                loadGabGallery(); // Refresh the Gab section if the function exists
            }
        }
    }, 'image/png');
}

// Switch between friends
function selectFriend(name) {
    currentFriend = name;
    document.getElementById("currentFriendName").innerText = name + "'s Gallery";
    document.getElementById("btnFriendName").innerText = name;
    document.getElementById("drawBtn").style.display = "block";
    loadFriendGallery(name);
}

// Load drawings from a specific friend's folder
async function loadFriendGallery(name) {
    const { data, error } = await supabaseClient.storage
        .from("gallery")
        .list(name, { limit: 100 }); // Folders are named after the friends

    const container = document.getElementById("gabGalleryContainer");
    if (!container || error) return;
    container.innerHTML = "";

    data.forEach((file) => {
        if (file.name === '.emptyFolderPlaceholder') return;
        const url = `${SUPABASE_URL}/storage/v1/object/public/gallery/${name}/${file.name}`;
        
        const wrapper = document.createElement("div");
        wrapper.className = "media-item doodle-item";

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "✕";
        delBtn.className = "doodle-delete-btn";
        delBtn.onclick = (e) => { e.stopPropagation(); deleteFriendDoodle(name, file.name); };

        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => openLightboxDirect(url);

        wrapper.appendChild(delBtn);
        wrapper.appendChild(img);
        container.appendChild(wrapper);
    });
}

// Save drawing to the ACTIVE friend's folder
async function saveDrawing() {
    if (!currentFriend) return alert("Please select a friend first!");
    const canvas = document.getElementById('paintCanvas');
    
    canvas.toBlob(async (blob) => {
        const fileName = `doodle-${Date.now()}.png`;
        const filePath = `${currentFriend}/${fileName}`; // Saves to friend-specific folder

        const { error } = await supabaseClient.storage
            .from("gallery")
            .upload(filePath, blob, { contentType: 'image/png' });

        if (error) {
            alert("Save failed!");
        } else {
            alert(`Doodle saved for ${currentFriend}! ✨`);
            closeDrawing();
            loadFriendGallery(currentFriend);
        }
    }, 'image/png');
}

// Delete from friend's folder
async function deleteFriendDoodle(friendName, fileName) {
    if (!confirm("Delete this doodle?")) return;
    await supabaseClient.storage.from("gallery").remove([`${friendName}/${fileName}`]);
    loadFriendGallery(friendName);
}

// Helper for Lightbox
function openLightboxDirect(url) {
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
    lb.style.display = "block";
    lbImg.src = url;
}

