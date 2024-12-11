// Pilih elemen-elemen DOM
let openShopping = document.querySelector('.shopping');
let closeShopping = document.querySelector('.closeShopping');
let listCard = document.querySelector('.listCard');
let checkoutButton = document.querySelector('.checkoutButton'); // Tombol Checkout
let quantity = document.querySelector('.quantity');
let body = document.querySelector('body');

// Array untuk menyimpan produk yang ditambahkan ke keranjang
let listCards = JSON.parse(localStorage.getItem('cart')) || []; // Muat data dari localStorage atau gunakan array kosong

// Fungsi untuk menyimpan data ke localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(listCards));
}

// Fungsi untuk membuka dan menutup panel shopping cart
openShopping?.addEventListener('click', () => {
    body.classList.add('active');
    openShopping.style.display = 'none';
});
closeShopping?.addEventListener('click', () => {
    body.classList.remove('active');
    openShopping.style.display = 'block';
});

// Fungsi untuk menambahkan produk ke keranjang belanja
function addToCartFromHtml(image, name, price, whatsappNumber) {
    let productIndex = listCards.findIndex(product => product && product.name === name);

    if (productIndex === -1) {
        let newProduct = {
            image: image,
            name: name,
            price: price,
            unitPrice: price,
            quantity: 1,
            whatsappNumber: whatsappNumber
        };
        listCards.push(newProduct);
    } else {
        listCards[productIndex].quantity++;
        listCards[productIndex].price = listCards[productIndex].quantity * listCards[productIndex].unitPrice;
    }
    saveCartToLocalStorage(); // Simpan data ke localStorage
    reloadCard();
}

// Fungsi untuk memperbarui isi keranjang belanja
function reloadCard() {
    listCard.innerHTML = ''; // Kosongkan isi sebelumnya
    let count = 0; // Total jumlah item
    let totalPrice = 0; // Total harga

    listCards.forEach((value, key) => {
        if (value != null) {
            totalPrice += value.price;
            count += value.quantity;

            // Buat elemen untuk menampilkan produk
            let newDiv = document.createElement('li');
            newDiv.innerHTML = `
                <div><img src="${value.image}" alt="${value.name}"/></div>
                <div>${value.name}</div>
                <div>Rp ${value.price.toLocaleString('id-ID')}</div> <!-- Format harga dengan Rp -->
                <div>
                    <input type="checkbox" class="select-item" data-key="${key}" />
                    <button onclick="changeQuantity(${key}, ${value.quantity - 1})">-</button>
                    <div class="count">${value.quantity}</div>
                    <button onclick="changeQuantity(${key}, ${value.quantity + 1})">+</button>
                </div>`;
            listCard.appendChild(newDiv);
        }
    });

    // Update total jumlah item di .quantity (market.html)
    const quantityElement = document.querySelector('.quantity');
    if (quantityElement) {
        quantityElement.innerText = count;  // Update jumlah item
    }

    // Tambahkan event listener untuk checkbox
    const checkboxes = document.querySelectorAll('.select-item');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => handleCheckboxChange(e, checkboxes));
    });
}

// Fungsi untuk mengubah jumlah produk di keranjang
function changeQuantity(key, newQuantity) {
    if (newQuantity === 0) {
        delete listCards[key]; // Hapus produk jika jumlahnya 0
    } else {
        listCards[key].quantity = newQuantity;
        listCards[key].price = newQuantity * listCards[key].unitPrice; // Hitung ulang harga berdasarkan jumlah
    }
    saveCartToLocalStorage(); // Simpan perubahan ke localStorage
    reloadCard();
}

// Fungsi untuk menangani aksi checkout
checkoutButton?.addEventListener('click', () => {
    const selectedItems = [];
    const checkboxes = document.querySelectorAll('.select-item');

    checkboxes.forEach(checkbox => {
        const key = checkbox.getAttribute('data-key');
        if (checkbox.checked && listCards[key]) {
            selectedItems.push(listCards[key]);
        }
    });

    if (selectedItems.length === 1) {
        const item = selectedItems[0];
        const whatsappUrl = `https://wa.me/${item.whatsappNumber}?text=Halo,%20saya%20(nama dan kelas)%20ingin%20membeli%20${item.name}%20sebanyak%20${item.quantity}%20dengan%20total%20Rp%20${item.price.toLocaleString('id-ID')}.`;
        window.open(whatsappUrl, '_blank'); // Buka WhatsApp di tab baru

        // Hapus item yang telah di-checkout dari keranjang
        const key = listCards.findIndex(product => product === item);
        delete listCards[key];
        saveCartToLocalStorage(); // Simpan perubahan ke localStorage
        reloadCard();
    } else if (selectedItems.length > 1) {
        alert('Silakan checkout satu produk pada satu waktu.');
    } else {
        alert('Silakan pilih satu produk untuk checkout.');
    }
});

function handleCheckboxChange(event, checkboxes) {
    const currentCheckbox = event.target;

    // Jika checkbox saat ini dicentang, matikan centang untuk checkbox lain
    if (currentCheckbox.checked) {
        checkboxes.forEach(checkbox => {
            if (checkbox !== currentCheckbox) {
                checkbox.checked = false;
            }
        });
    }

    // Update tombol Checkout
    updateCheckoutState();
}

function updateCheckoutState() {
    const checkboxes = document.querySelectorAll('.select-item');
    let totalPrice = 0;

    checkboxes.forEach(checkbox => {
        const key = checkbox.getAttribute('data-key');
        if (checkbox.checked && listCards[key]) {
            totalPrice += listCards[key].price;
        }
    });

    // Perbarui tombol Checkout
    checkoutButton.innerText = `Checkout - Rp ${totalPrice.toLocaleString('id-ID')}`;
}

function buyNow(productName, price, whatsappNumber) {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Halo,%20saya%20(nama dan kelas)%20ingin%20membeli%20${productName}%20dengan%20harga%20Rp%20${price.toLocaleString('id-ID')}.`;
    window.open(whatsappUrl, '_blank'); // Buka WhatsApp di tab baru
}

// Muat data awal dari localStorage
reloadCard();
