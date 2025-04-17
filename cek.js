const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const readline = require('readline');

// Konfigurasi proxy jika diperlukan
const PROXY = 'http://savagethis-zone-custom-region-ID-sessid-bjbvlNJg-sessTime-5:savagethis@111.91.2.228:6200'; // Ganti dengan proxy Anda jika diperlukan
const httpsAgent = new HttpsProxyAgent(PROXY);

// Konfigurasi header sesuai kebutuhan Anda
const headers = {
  'authority': 'qpon-food-gl.qponmobile.com',
  'content-type': 'application/json;charset=UTF-8',
  'accept': 'application/json, text/plain, */*',
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36',
  'x-digital-food': '%7B%22deviceId%22%3A%22da579943-52d0-4f81-bcce-75ca9e0e9e8d%22%2C%22channel%22%3A%22CUSTOMER%22%2C%22h5Version%22%3A%222.5.4%22%2C%22h5VersionCode%22%3A2005004%2C%22netstate%22%3A1%2C%22requestId%22%3A%22m9jhhswoj2qhv%22%2C%22sessionId%22%3A%22m9jcgr2j5pb4n%22%2C%22sourceTag%22%3A%22%22%7D',
  'x-sys': '%7B%22model%22%3A%22K%22%2C%22ht%22%3A560%2C%22wd%22%3A360%2C%22brand%22%3A%22%22%2C%22hardwareType%22%3A%22Mobile%22%2C%22locale%22%3A%22id-ID%22%2C%22osType%22%3A0%2C%22iosVersionCode%22%3A%2210%22%7',
  'sign': '8cb4368e59aee0d514d56add712a5c80edd50d56c48f88c7a0541b5f5876d715',
  'timestamp': '1744780892568',
  'authorize': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NzA2NDA5MzRmYzI0NGRiYjc4NTRkZmE0MTZkODYzYSIsImlzcyI6ImRpZ2l0YWwtZm9vZCIsImlhdCI6MTc0NDc3MjU3NiwiZXhwIjoxNzQ0Nzc5Nzc2LCJwYXlsb2FkIjoiYit5RE9uYWUvQkZJc1E5eFUzczlncDFIcHc0Z0loUWNhVzVHQUVFRGROemJTd1hBbnZReFA2dTdvWHA5eERCKzh6TUV1N3VjcGNvajRJUUtzcFJHUHZpYzMrbXlsbFN2VFN0L0pvYTJIWHM5UWQzd2x3TWFTUzNmQjR6VnpHWHFuL3hoNk1zRThNZ3Y5TXRNek1UUG5yZUw5KzZHcWVGKzl2elkyN0NEcEdBRDhoWlcvTm5nc1lOTXV2L3BaaWFQS296ZmZTSWg5dytaZ1owaFhSa1pxVmh6bHdUWHVvUDhXMWFmaXlWRy9xaVdJSVEydnI0amRkZW1QYy9IY3U1eGVCOFoyMVV0dHpRUUtLQVpDRG9iVVE9PSIsInRva2VuVHlwZSI6IkFDQ0VTUyJ9.LfxtwOVAMQxNus7lBL8bGF9TWkWqzmHd7O8h9mc8HSA',
  'appkey': 'AuHXwhmjE4EiMSq7WY3FTm',
  'cptype': 'qpon',
  'identitytype': 'C',
  'x-app': '%7B%22hostType%22%3A%22WEB%22%7D',
  'x-euler-headers': 'accept;appkey;authorize;cptype;identitytype;sign;timestamp;x-app;x-digital-food;x-model;x-protocol-ver;x-sys',
  'referer': 'https://qpon.id/',
  'origin': 'https://qpon.id'
  // Tambahkan header yang diperlukan di sini
};

// Token dan Chat ID Telegram
const TELEGRAM_TOKEN = '7662277377:AAFaXz6G_3NuFIgbX8XONwaEEPqtoKtLiL4'; // Ganti dengan Token API bot Anda
const TELEGRAM_CHAT_ID = '1236786198'; // Ganti dengan Chat ID Anda

// Fungsi untuk mengirim notifikasi Telegram
async function sendTelegramNotification(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log('📩 Notifikasi Telegram berhasil dikirim.');
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi Telegram:', error.message);
  }
}

// Membuat antarmuka readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Menanyakan skuId kepada pengguna
rl.question('Masukkan skuId produk yang ingin dipantau: ', (inputSkuId) => {
  const skuId = inputSkuId.trim();

  // Fungsi untuk memeriksa stok
  async function checkStock() {
    try {
      const response = await axios.post(
        'https://qpon-food-gl.qponmobile.com/digital-food/local_life/product/detail',
        {
          skuId,
          userLat: null,
          userLng: null,
          sessionId: 'm9jcgr2j5pb4n', // Ganti dengan sessionId Anda
          requestId: 'm9jhhswoj2qhv', // Ganti dengan requestId Anda
          timestamp: Date.now(),
        },
        { headers, httpsAgent }
      );

      const product = response.data?.data;
      const remainingStock = product?.remainingStock || 0;
      const name = product?.productName?.['id-ID'] || 'Tidak diketahui';

      if (remainingStock > 0) {
        const message = `✅ *Stok Tersedia!*\nProduk: *${name}*\nSisa Stok: *${remainingStock}*`;
        console.log(message);
        await sendTelegramNotification(message);
        // Tambahkan logika tambahan di sini, misalnya, melakukan pembelian otomatis
      } else {
        console.log(`❌ Stok habis untuk produk: ${name}`);
      }
    } catch (error) {
      console.error('❌ Terjadi kesalahan saat memeriksa stok:', error.message);
    }
  }

  // Jalankan pengecekan stok secara berkala setiap 30 detik
  setInterval(checkStock, 30000);

  // Tutup antarmuka readline setelah input diterima
  rl.close();
});
