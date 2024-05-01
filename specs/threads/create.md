# Threads
## Fitur: Tambah Threads
Sebagai seorang pengguna, saya ingin menambahkan threads.

### Payload:
```json
{
  "title": "string",
  "body": "string"
}
```

### spesifikasi:
- ketika menambahkan threads tanpa memberikan entitas yang dibutuhkan:
  - maka error
- ketika menambahkan threads dengan memberikan entitas yang tipe datanya tidak sesuai:
  - maka error
- ketika manambahkan threads dengan title lebih dari 100 karakter:
  - maka error
- ketika menambahkan threads dengan payload yang benar:
  - maka threads baru harus terbuat

### catatan sisi sistem:
- Simpan threads baru pada database
- berikan response seperti berikut:
```json
{
  "status": "success",
  "data": {
    "addedReply": {
      "id": "reply-BErOXUSefjwWGW1Z10Ihk",
      "content": "sebuah balasan",
      "owner": "user-CrkY5iAgOdMqv36bIvys2"
    }
  }
}
```
