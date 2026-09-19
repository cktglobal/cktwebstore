// CKT Global Webstore — Application Logic
(function(){
  "use strict";
  const STORE_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEwGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI2LTAxLTIwPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmVhYTY4M2IyLTkzZTMtNGY1MS04NzU5LWEwNGI3MDRmODVkYTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5BcHAgSWNvbiAxOTJ4MTkyIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRp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aQBCiNra2jlz5tx8881r1qxpaWn55je/+eSTT/b29hZsrba2tr6+vqmp6a//+q8vvPBCK7uxUF9f349//OOvf/3rpk3LsqZPn37TTTddfPHFjuO4rtva2vqf//mf9957b3dn50iTScxjdvPNN9999933339/d3f3sKdYljVx4sRYLHbVVVd96lOfmjx5cj7dU6nUY4899o1vfOPIkSNtbW29vb2jk+6GQCP2RMdisY9//OP33HPPokWLhBCPPvroP/7jP27fvj2RSOQf1tfXt3fv3l27dq1evXrNmjXLly8PhUJPPvnkrl27csdorTs7Ow8cOLBr165TTz111qxZOTnkuu7Xvva1Bx54YO/evd3d3aO7w0gk8tGPfvTuu++eP3/+Y4899k//9E8tLS2u6+ZGk5mTyWRra+uGDRuampouvPDCc845R0q5a9eu/KU2h1Qq1dHRsW/fvnfeeefMM8+cMmVK7vvnnnvu0UcfbWtrO3r06OHDh999992NGzdKKc8444xoNNrQ0DBv3ryqqqqNL79cMKO3CGbNmvXpT3966tSpRnyWMhpGwLS1tW3durWurm7hwoWBQCD3669//eu77rpr+/btnZ2dnueNWjcwnuiRmfGRSOTjH//4XXfdNWPGDAAvvvji/fff/9ZbbxUUD77vv/jii1/5ylc6Ojqi0aiU0iq0F5jW+q233vrtb3+bvxi3tLS88MILnZ2do769SCRy44033nvvvbNnz3766afvu+++gwcPAmDmAW0aHt9zzz3btm2bMmXKbbfddsstt9TW1g7VslJq+/btjz/+eJFV1ff9995777vf/e5LL70EgIjq6+uvv/76yy+/fER3IaU85ZRT5s2bB2DRokXTpk0r/VxmjsfjDz744Pvvv5+7Zd/3v/GNb+zatct8U74NMTICXXLJJZ///OcnTZpERK2trQ8++OCOHcW27GHmDRs2PP7446lUSghRXV09VFh4z549+cJ57969LS0tI+pbDsYe/NjHPvaVr3ylrq6upaXlq1/96oEDB4p0kplbWloeeOCBzs7O2tradevW3XjjjUV6m0gkWlpa4vF48Z7s3r17/fr1ZsUkoqlTp1522WVFqDkYsVhs9erVZnEPBoOXX355JBIp/XQALS0tbW1tOaJ0dXX19fWNoUk7AgItWrToM5/5zPTp0wGkUqnnn3/+mWeeKX4KM3d2dv7sZz/bu3cvERWUQAatra19ff35y21tbfka1YhARJdffvntt99eW1vred5PfvKT/HWzCNavX//ss88y88SJEz/zmc8sW7asoAZqEI/H8zs8FDZs2PDee++Zv4UQCxYsmDt3bok3AqCuru6DH/xg7vTVq1eHQqHSTzfo6OjIEaijo6Pg6jxqlEqgmpqa66+/fvny5UZNaW1t/d73vleKQgdg06ZN27Ztc13XGap8CWhvb8+/sZ6enpyqO1Kceuqpn/3sZ0855RQiamlpef7550vRE5m5p6fn+9//vunGrFmz/uZv/qbIkqGUKkX+v/76662trbkjJ02aNHHixBJvxLKs2bNnz5gxw+iXRNTU1HTOOeeMNLmnt7c31wHXdUdnzw6F0vaJlnLu3LnXXnttMBg0ndi6deumTZtKvEYqlXr66ac7OzvN6QUxwHLWupRX5xSAbduf+MQnlixZIqXUWr/wwgsvv/xyiecqpXbv3p07ftWqVddff/0A23CkSKfTfX19uXsJBAL5+mxxhMPhVatWvfbaazt37jTfRKPRtWvXSimHKKEujPyRTKVSJ4BAkUjkvPPOmzlzpvnY19f3y1/+crC7uQj+67/+68CBA0VueyjXy0ixfPnytWvXRqNRAN3d3a+//nopC00ObW1tv/rVr0xPgsHgDTfcMCK9tSDy72uwCl8EVVVV8+fP/8lPfrJ161bzTSAQWLZsWSw2+pcojNU451ASgRoaGq666iqjEDBza2vrM888MyIJkUgk3nzzTcuyxnW3LNu2L7vsspkzZ5qrHD58eNu2bSNqIZFIbNmyJaf2Njc3/9mf/dmIHvfByD+99KWZiObPny+l/OEPf7hp0ybzuAohpk6dunbt2rGNwJSD4YdGStnU1LRkyRLzkZlfffXVEYkfAFrr559//ujRowDGj0MzZsxYunSpWXSY+dChQ9u3bx9RC8a7v3v3bvMxHA5fdNFFRVbeYRGJRKqrq3PK+IEDB4rYg/kQQqxdu3bv3r2u67799tvvvPOO+b62tnb16tWj7s+YY3gCBYPBVatW5fRfrfXGjRtHqslrrdevX//kk08qpcYvx2Du3Lk5G8fzvIMHD3Z2do6oBWZub29/8803zUcp5YwZM84888xRd+mss86aPn26eWbS6fTWrVv37NlTyolENGvWrN/+9rda69dee+21114z3weDwYULF+bUiROO4QkUCAQWLVqUExta661bt5YY1ctHR0fH+++/P+IOjgRTpkyZPHmy+TudTpf4rOeDmdva2t58880cy2tqas4777zR9YeI1qxZc8opp5iWd+/e/eijjw5w2Q+F1atXSym3bt1qXCHbt2/PLawzZswYdZfGHMMTyLbtWbNm5Qh09OjRUccWxhWxWGzOnDl2dp+KVCq1f//+UbTjeV57e3vuCQmFQub2R7ry2rb94Q9/+JprrgkGg0qpd99994EHHtiyZUuJp19yySX79u3LKUwvvfTSgQMHzLA3NDQsXry4iFPteGL4Tkgpa2trc8NnAijj3KvRIBaLmQCLgeHB6JpKpVLpdNqoPo7jNDQ0DPvAEJFt27ZtO44TDofD4fDixYv/7u/+bs6cOb29vTt27PjmN7/5xBNPKKVKyW2KRqPz58//7ne/m3N2b9q0affu3bNnz7Ysy7KsM844Y+7cua+//vrobnAMMTyBotFoPtk7OjqKZ5mcKITD4cbGxtxHz/Pa2tpG15Trum425CmEGFaJllLOnDnzqquuqq6unjRp0qxZsxYsWLB48WLbtolo9+7d3/72t3fu3FnErz0A559/fjgc3rVrV+5ZdV33lVdeOe+888zDPG/evJOEQMO9M5WoqanJztu/KJFIjK0naqxgWVb+TCulRuQByodJNBvRpadNm7Z06dLm5mbbtt97770NGzY8/PDDf/jDH3p7e5ctW/bggw9+73vfu/XWWxcsWMDMw66GS5cu3bFjxwAJ+qtf/Sr3jVnFotHouLpFSsHwEqi2tjbfk3HyeCCKIz9FcLyRTqefe+65O++8M//LYDC4YMGClStXfuITn5gzZ87SpUsXLFiwYsWKO++885VXXinSWmNj4/z58x9//PGOjo7873fs2LFr166mpibLsoQQa9as+elPf5qLq58oDK9En5zyZjCY+diiFh6rpXZ0M5RKpbZs2fJv//ZvN998c0tLCzMHg8ELLrjgi1/8Yn7m02CcfvrpwWDQWPt2HqSUv/vd73JG3OLFiydOnHjCrZnhJVBnZ2c+h8bbmzxqJJPJfKXHsqyamprRNWWqA8zfvu8PlaBYClKp1EsvvfTwww9//vOfr6qqsixrzZo1V1xxxYMPPljQJS2EmDVr1pIlS+677750Oj0gcba2tjanTkQikUsvvXT7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p7W1dc+ePYNXymg0euWVV95yyy2O4ySTySeeeOK222575plnBj9hlmXNnDnzr/7qrxYvXpy7TyIyU/7OO+8kEgmt+18bRUQm3+qOO+644oorzJZWP/3pT3MFoMhmpr7xxhs1NTXNzc0zZ85sbGzctm3bYMe3WT7mz59/zz33nHXWWfv377///vv//d//vciuOVLKM88885ZbbslNgxFIPT09W7Zs8TwvZ2GFw+F58+bdfffdl1xySTAYZObu7u4HHnjg4YcfzimUlmWde+65t99++8yZMx3HSafTv//974uorkIIx3HWrl179dVX57QZy7IaGhr27dvX0tKSP+WRSOTWW28dsMBVVVVNnTp127ZtJjMnf2BDoVBjY+PNN9/82c9+dsKECa7rvvzyy7/+9a8L9sRsrjCyhId0Or19+/b9+/dPnjy5pqZm0qRJy5Yta21t7e7uzlVc27Y9ZcqUK6+88q677qqrq3vvvfceeuihe++915yYXxhltneZP3/+pz71qauuumqAHmrsi3nz5hn2NDQ0TJgwYdKkSU1NTevWrbvjjjtWrlxpNI94PP7II48MSGDVWh85cmTz5s3JZHLq1KlLliyZNWuWSdHKiSspZUNDwznnnHPnnXeeeeaZmzZt+vKXv/zzn/+8yPYu06dPX7JkyR133GE8T7mfAoHAaaedFolEEolEdXV1Y2Njc3PzNddcc9ddd11wwQW2bff29u7Zs+c73/nOt771rY6ODhPYmjZt2qpVq+68884PfOADlmU5jjNt2jTf9zs6OhKJxODlY9q0aTNmzLjkkktuu+22nEgzc1lXVzdv3jzjwggEAtXV1dOnT//Lv/zLdevW1dfX5wsnIURTU9PKlSsDgUAymayvrzdxp+bm5g996EN33HHHddddZ3Zscl13y5YtxQk0mrg6EU2ePPmTn/zk+eef39TUFA6HN2zY8MMf/tBUEE+cOPHKK68866yzuru7d+zY8dBDDz3//PM5EZXvGq+rq/v7v//7008/vbq6eigdRWutlEqn00abC4VCgUDAJMTkBqWjo+Pzn/98rm5hAKSUK1euvOmmm0xxxRNPPGGqSoiourrabD2TSCSeeuqpH/zgB0ePHi0SE7jsssuuvfZak3k9uMMmnySdTnd3dzuOEwqFhBDpdNr3/e7u7p07d/7yl7800Tpz/IQJEz772c+uXLkyEonkG2i+7+/bt+9LX/rSgJJ+KeUXvvCFlStXmnj24AXLnHvo0KFNmzYppc4777zGxsbBDqfcwUopk2tg8nfNLOQ7iszSce+99xYcjdFvMJXDlClTVq9efdppp9XW1gYCgXA4nEwmzT52ZoOc7du3F5kPy7JmzZqF4ZLUjB6a+zi4ttJYJcXVPdu2ly1btnz58unTp0ejUcdxlFKpVMoEnjZs2FAkepBDY2OjySgt0uHchDFzIpE4cuTIUDV0juNMmTIlGAwOaM3c7/79+wdkVJoASCAQKD5ctm0nk0mtdSQSGdaLkz+2AxKqAGitu7q6hsoMHgMC5cO27VgslkqlRp1IetxgWVYsFjNOzhOYkFU8u37M9xUdc4wxgSr47wZDoMpG4xWUhQqBKigLFQJVUBYqBKqgLFQIVEFZqBCogrJQIVAFZaFCoArKQoVAFZSFCoEqKAsVAlVQFioEqqAsVAhUQVmoEKiCslAhUAVloUKgCspChUAVlIUKgSooCxUCVVAWKgSqoCxUCFRBWagQqIKyUCFQBWWhQqAKykKFQBWUhQqBKigLFQJVUBYqBKqgLFQIVEFZqBCogrJQIVAFZeH/AKFrQb/7w4o/AAAAAElFTkSuQmCC";

  /* ================= SUPABASE CLIENT ================= */
  let supabaseClient = null;
  let supabaseConfigOk = false;
  try{
    if(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && !window.SUPABASE_URL.includes('YOUR-PROJECT')){
      supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      supabaseConfigOk = true;
    }
  }catch(e){ console.error('Supabase init failed', e); }

  /* ================= STATE ================= */
  const state = {
    products: [],
    settings: {
      storeName: "Kedai Saya",
      storeLogo: STORE_LOGO,
      qrImage: null,
      adminPin: "1234",
      promoVideoType: 'none',
      promoVideo: null,
      promoVideoUrl: '',
      promoImage: null,
      promoImages: [],
      telegramBotToken: '',
      telegramChatId: '',
      senderName: '',
      senderPhone: '',
      senderEmail: '',
      senderAddress1: '',
      senderCity: '',
      senderState: '',
      senderPostcode: '',
      shippingRates: {
        semenanjung: [
          {minKg:0, maxKg:3, rate:5.90},
          {minKg:3.01, maxKg:5, rate:7.00},
          {minKg:5.01, maxKg:10, rate:10.00}
        ],
        sarawak: [
          {minKg:0, maxKg:3, rate:12.00},
          {minKg:3.01, maxKg:5, rate:15.00},
          {minKg:5.01, maxKg:10, rate:20.00}
        ],
        sabah: [
          {minKg:0, maxKg:3, rate:12.00},
          {minKg:3.01, maxKg:5, rate:15.00},
          {minKg:5.01, maxKg:10, rate:20.00}
        ]
      }
    },
    cart: [],           // {productId, variantLabel, qty}
    ordersCache: {},     // id -> order object
    adminUnlocked: false,
    selectedCategory: 'all',
    searchQuery: '',
    detailProduct: null,
    detailImgIndex: 0,
    detailQty: 1,
    detailVariant: null,
    lastOrder: null
  };

  const ZONE_LABELS = {semenanjung:"Semenanjung Malaysia", sarawak:"Sarawak", sabah:"Sabah"};
  const CATEGORIES = ["Kawalan Serangga", "Isi Rumah", "Pertanian", "Kelengkap Dapur", "Lain-Lain"];

  function openMailto(to, subject, body){
    const url = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  // Tukar nombor telefon tempatan (cth: 012-345 6789 / 0123456789) ke format
  // antarabangsa yang wa.me perlukan (cth: 60123456789 — tiada '+', tiada '0' depan)
  function toWhatsAppPhone(phone){
    let d = String(phone||'').replace(/\D/g,'');
    if(d.startsWith('0')) d = '60' + d.slice(1);
    else if(!d.startsWith('60')) d = '60' + d;
    return d;
  }
  // Buka wa.me dengan mesej pra-isi — admin masih perlu tekan "Hantar" sendiri
  // dalam WhatsApp (had biasa wa.me: tiada cara hantar automatik tanpa WhatsApp
  // Business Cloud API rasmi berbayar), tapi ini cara paling cepat & percuma.
  function openWhatsApp(phone, message){
    const num = toWhatsAppPhone(phone);
    if(!num){ toast('Nombor telefon pelanggan tidak sah'); return; }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
  }
  async function sendTelegramNotification(message){
    const token = state.settings.telegramBotToken;
    const chatId = state.settings.telegramChatId;
    if(!token || !chatId) return {ok:false, error:'Telegram belum ditetapkan'};
    try{
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({chat_id: chatId, text: message, parse_mode: 'HTML'})
      });
      const data = await res.json();
      if(!data.ok) console.error('Telegram send error:', data.description);
      return {ok: !!data.ok, error: data.description};
    }catch(err){
      console.error('Telegram fetch error:', err);
      return {ok:false, error: String(err)};
    }
  }
  function orderTelegramMessage(o){
    const lines = o.items.map(it=>`• ${it.qty}x ${escapeHtml(it.name)}${it.variantLabel&&it.variantLabel!=='none'?' ('+escapeHtml(it.variantLabel)+')':''} — ${money(it.price*it.qty)}`).join('\n');
    return [
      `🛒 <b>Pesanan Baru Diterima</b>`,
      ``,
      `No. Pesanan: ${o.id}`,
      `Nama: ${escapeHtml(o.customer.name)}`,
      `Telefon: ${escapeHtml(o.customer.phone)}`,
      `Alamat: ${escapeHtml(o.customer.address)}, ${escapeHtml(o.customer.postcode)} (${ZONE_LABELS[o.customer.zone]})`,
      ``,
      `<b>Item:</b>`,
      lines,
      ``,
      `Penghantaran: ${money(o.shippingCost)}`,
      `<b>Jumlah: ${money(o.total)}</b>`
    ].join('\n');
  }
  function orderEmailBody(o){
    const lines = o.items.map(it=>`- ${it.qty}x ${it.name}${it.variantLabel&&it.variantLabel!=='none'?' ('+it.variantLabel+')':''} — ${money(it.price*it.qty)}`).join('\n');
    return [
      `No. Pesanan: ${o.id}`,
      `Nama: ${o.customer.name}`,
      `Telefon: ${o.customer.phone}`,
      `Alamat: ${o.customer.address}, ${o.customer.postcode} (${ZONE_LABELS[o.customer.zone]})`,
      ``,
      `Item:`,
      lines,
      ``,
      `Penghantaran: ${money(o.shippingCost)}`,
      `Jumlah: ${money(o.total)}`,
      `Status: ${statusLabel(o.status)}`
    ].join('\n');
  }
  // Mesej WhatsApp terus untuk pelanggan — guna *bold* gaya WhatsApp (bukan HTML),
  // dan ditulis macam mesej terus kepada pelanggan (bukan laporan dalaman macam
  // orderEmailBody/orderTelegramMessage yang untuk rujukan admin).
  function orderWhatsAppMessage(o){
    const lines = o.items.map(it=>`• ${it.qty}x ${it.name}${it.variantLabel&&it.variantLabel!=='none'?' ('+it.variantLabel+')':''} — ${money(it.price*it.qty)}`).join('\n');
    return [
      `Hai ${o.customer.name}, terima kasih kerana membeli-belah di CKT Global Webstore!`,
      ``,
      `*No. Pesanan:* ${o.id}`,
      `*Status:* ${statusLabel(o.status)}`,
      o.trackingNumber ? `*No. Tracking Pos Laju:* ${o.trackingNumber}` : ``,
      ``,
      `*Item:*`,
      lines,
      ``,
      `*Jumlah:* ${money(o.total)}`,
      ``,
      `Sebarang pertanyaan, boleh terus balas mesej ni. Terima kasih! 🙏`
    ].filter(Boolean).join('\n');
  }

  /* ================= DATA LAYER (Supabase) ================= */
  function rowToProduct(row){
    return {id:row.id, name:row.name, description:row.description, price:Number(row.price), weight:Number(row.weight), images:row.images||[], variants:row.variants||[], category:row.category||'Lain-Lain', stock:Number(row.stock)||0, testimonials:row.testimonials||[]};
  }
  function rowToOrder(row){
    return {
      id:row.id, createdAt:row.created_at, customer:row.customer, items:row.items,
      weight:Number(row.weight), subtotal:Number(row.subtotal), shippingCost:Number(row.shipping_cost),
      total:Number(row.total), receiptImage:row.receipt_image, status:row.status, trackingNumber:row.tracking_number||'',
      completedAt:row.completed_at||null,
      waybillPdfUrl:row.waybill_pdf_url||null
    };
  }

  function applyBrandingToHeader(storeName, storeLogo){
    document.getElementById('storeNameDisplay').textContent = storeName || 'Kedai Saya';
    const logoImg = document.getElementById('storeLogoImg');
    if(logoImg){
      if(storeLogo){ logoImg.src = storeLogo; logoImg.style.display='block'; }
      else { logoImg.style.display='none'; }
    }
  }
  function loadBrandingCache(){
    try{
      const raw = localStorage.getItem('cktglobal_branding_cache');
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }
  function saveBrandingCache(storeName, storeLogo){
    try{ localStorage.setItem('cktglobal_branding_cache', JSON.stringify({storeName, storeLogo})); }catch(e){}
  }

  async function loadAll(){
    if(!supabaseConfigOk){
      console.warn('Supabase belum dikonfigurasi — sila isi SUPABASE_URL & SUPABASE_ANON_KEY di bahagian <head>.');
      const cartRaw = localStorage.getItem('cktglobal_cart');
      if(cartRaw){ try{ state.cart = JSON.parse(cartRaw); }catch(e){} }
      return;
    }
    const [{data:settingsRow, error:settingsErr}, {data:productRows, error:productsErr}] = await Promise.all([
      supabaseClient.from('settings').select('*').eq('id',1).maybeSingle(),
      supabaseClient.from('products').select('*').order('created_at',{ascending:true})
    ]);
    if(settingsErr) console.error(settingsErr);
    if(settingsRow){
      state.settings = {
        storeName: settingsRow.store_name || state.settings.storeName,
        storeLogo: settingsRow.store_logo || state.settings.storeLogo,
        qrImage: settingsRow.qr_image || null,
        adminPin: settingsRow.admin_pin || state.settings.adminPin,
        shippingRates: settingsRow.shipping_rates || state.settings.shippingRates,
        promoVideoType: settingsRow.promo_video_type || 'none',
        promoVideo: settingsRow.promo_video || null,
        promoVideoUrl: settingsRow.promo_video_url || '',
        promoImage: settingsRow.promo_image || null,
        // Kedai lama cuma ada SATU imej banner (kolum promo_image). Kalau kolum
        // baru promo_images kosong tapi ada imej lama, migrate terus ke array
        // supaya banner sedia ada tak hilang selepas kemaskini ni.
        promoImages: (settingsRow.promo_images && settingsRow.promo_images.length)
          ? settingsRow.promo_images
          : (settingsRow.promo_image ? [settingsRow.promo_image] : []),
        telegramBotToken: settingsRow.telegram_bot_token || '',
        telegramChatId: settingsRow.telegram_chat_id || '',
        senderName: settingsRow.sender_name || '',
        senderPhone: settingsRow.sender_phone || '',
        senderEmail: settingsRow.sender_email || '',
        senderAddress1: settingsRow.sender_address1 || '',
        senderCity: settingsRow.sender_city || '',
        senderState: settingsRow.sender_state || '',
        senderPostcode: settingsRow.sender_postcode || ''
      };
    }
    if(productsErr) console.error(productsErr);
    if(productRows) state.products = productRows.map(rowToProduct);
    const cartRaw = localStorage.getItem('cktglobal_cart');
    if(cartRaw){ try{ state.cart = JSON.parse(cartRaw); }catch(e){} }
  }

  async function saveCart(){ localStorage.setItem('cktglobal_cart', JSON.stringify(state.cart)); }

  function loadCustomerProfile(){
    try{
      const raw = localStorage.getItem('cktglobal_customer_profile');
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }
  function saveCustomerProfile(profile){
    try{ localStorage.setItem('cktglobal_customer_profile', JSON.stringify(profile)); }catch(e){}
  }

  function loadMyOrders(){
    try{
      const raw = localStorage.getItem('cktglobal_my_orders');
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function addToMyOrders(order){
    try{
      let list = loadMyOrders();
      list = list.filter(o=>o.id!==order.id); // elak duplikasi
      list.unshift({id:order.id, createdAt:order.createdAt, total:order.total});
      list = list.slice(0,20); // had 20 pesanan terkini
      localStorage.setItem('cktglobal_my_orders', JSON.stringify(list));
    }catch(e){}
  }
  function removeFromMyOrders(id){
    try{
      let list = loadMyOrders();
      list = list.filter(o=>o.id!==id);
      localStorage.setItem('cktglobal_my_orders', JSON.stringify(list));
    }catch(e){}
  }
  function formatOrderDate(iso){
    try{
      const d = new Date(iso);
      return d.toLocaleDateString('ms-MY', {day:'2-digit', month:'short', year:'numeric'}) + ', ' +
             d.toLocaleTimeString('ms-MY', {hour:'2-digit', minute:'2-digit'});
    }catch(e){ return ''; }
  }

  async function saveSettings(){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    const {error} = await supabaseClient.from('settings').update({
      store_name: state.settings.storeName,
      store_logo: state.settings.storeLogo,
      qr_image: state.settings.qrImage,
      admin_pin: state.settings.adminPin,
      shipping_rates: state.settings.shippingRates,
      promo_video_type: state.settings.promoVideoType,
      promo_video: state.settings.promoVideo,
      promo_video_url: state.settings.promoVideoUrl,
      promo_image: (state.settings.promoImages && state.settings.promoImages[0]) || state.settings.promoImage,
      promo_images: state.settings.promoImages || [],
      telegram_bot_token: state.settings.telegramBotToken,
      telegram_chat_id: state.settings.telegramChatId,
      sender_name: state.settings.senderName,
      sender_phone: state.settings.senderPhone,
      sender_email: state.settings.senderEmail,
      sender_address1: state.settings.senderAddress1,
      sender_city: state.settings.senderCity,
      sender_state: state.settings.senderState,
      sender_postcode: state.settings.senderPostcode
    }).eq('id',1);
    if(error) console.error('Settings save error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
    return {ok:!error, error};
  }

  async function insertProductRow(p){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    const {error} = await supabaseClient.from('products').insert({
      id:p.id, name:p.name, description:p.description, price:p.price, weight:p.weight, images:p.images, variants:p.variants, category:p.category, stock:p.stock, testimonials:p.testimonials
    });
    if(error) console.error('Insert product error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
    return {ok:!error, error};
  }
  async function updateProductRow(p){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    const {error} = await supabaseClient.from('products').update({
      name:p.name, description:p.description, price:p.price, weight:p.weight, images:p.images, variants:p.variants, category:p.category, stock:p.stock, testimonials:p.testimonials
    }).eq('id', p.id);
    if(error) console.error('Update product error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
    return {ok:!error, error};
  }
  async function deleteProductRow(id){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    const {data, error} = await supabaseClient.from('products').delete().eq('id', id).select();
    if(error){
      console.error('Delete product error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
      return {ok:false, error};
    }
    if(!data || data.length===0){
      const noRowError = 'Tiada baris dipadam — kemungkinan disekat oleh polisi RLS (semak polisi "delete" untuk jadual products di Supabase)';
      console.error('Delete product error:', noRowError);
      return {ok:false, error:noRowError};
    }
    return {ok:true, error:null};
  }
  // Kurangkan stok di server (guna fungsi DB "decrement_stock" supaya proses tolak
  // stok berlaku terus di Supabase — elak masalah 2 pelanggan checkout serentak
  // menyebabkan stok tersimpan salah akibat baca-lepas-tulis dari browser.
  async function decrementStockRow(productId, qty){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    const {data, error} = await supabaseClient.rpc('decrement_stock', {p_id: productId, qty});
    if(error) console.error('Decrement stock error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
    return {ok:!error, error, newStock: data};
  }

  async function saveOrder(order){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    const row = {
      id: order.id,
      created_at: order.createdAt,
      customer: order.customer,
      items: order.items,
      weight: order.weight,
      subtotal: order.subtotal,
      shipping_cost: order.shippingCost,
      total: order.total,
      receipt_image: order.receiptImage,
      status: order.status,
      tracking_number: order.trackingNumber || '',
      completed_at: order.completedAt || null,
      waybill_pdf_url: order.waybillPdfUrl || null,
      payment_method: order.paymentMethod || 'manual'
    };
    const {error} = await supabaseClient.from('orders').upsert(row);
    if(error) console.error('Order save error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
    return {ok:!error, error};
  }
  async function fetchOrder(id){
    if(state.ordersCache[id]) return state.ordersCache[id];
    if(!supabaseConfigOk) return null;
    const {data, error} = await supabaseClient.from('orders').select('*').eq('id', id).maybeSingle();
    if(error){ console.error('Fetch order error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code); return null; }
    if(!data) return null;
    const o = rowToOrder(data);
    state.ordersCache[id] = o;
    return o;
  }
  async function fetchAllOrders(){
    if(!supabaseConfigOk) return [];
    const {data, error} = await supabaseClient.from('orders').select('*').order('created_at',{ascending:false});
    if(error || !data) return [];
    return data.map(rowToOrder);
  }
  async function deleteOrderRow(id){
    if(!supabaseConfigOk) return {ok:false, error:'Supabase belum disambungkan'};
    // .select() di sini penting: ia buat Supabase pulangkan baris yang betul-betul
    // dipadam. Kalau RLS/polisi sekat operasi ni secara senyap, delete() biasa akan
    // "berjaya" walaupun 0 baris terjejas — dengan .select() kita boleh kesan kes tu
    // dan tunjuk error yang jelas, bukan biarkan pesanan nampak macam dah terpadam.
    const {data, error} = await supabaseClient.from('orders').delete().eq('id', id).select();
    if(error){
      console.error('Delete order error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code);
      return {ok:false, error};
    }
    if(!data || data.length===0){
      const noRowError = 'Tiada baris dipadam — kemungkinan disekat oleh polisi RLS (semak polisi "delete" untuk jadual orders di Supabase)';
      console.error('Delete order error:', noRowError);
      return {ok:false, error:noRowError};
    }
    return {ok:true, error:null};
  }
  async function fetchOrdersByPhone(phone){
    if(!supabaseConfigOk) return [];
    const digits = phone.replace(/\D/g,'');
    const {data, error} = await supabaseClient.from('orders').select('*').eq('customer->>phoneDigits', digits).order('created_at',{ascending:false});
    if(error){ console.error('Fetch orders by phone error:', error.message, '| details:', error.details, '| hint:', error.hint, '| code:', error.code); return []; }
    if(!data) return [];
    return data.map(rowToOrder);
  }

  /* ================= UTIL ================= */
  function uid(prefix){ return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,7); }
  function money(n){ return 'RM' + (Math.round(n*100)/100).toFixed(2); }
  function toast(msg, duration){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), duration || 1800);
  }
  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function resizeImage(file, maxWidth){
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = function(e){
        const img = new Image();
        img.onload = function(){
          let w = img.width, h = img.height;
          if(w > maxWidth){ h = Math.round(h * (maxWidth/w)); w = maxWidth; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img,0,0,w,h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function getZone(postcode){
    const digits = String(postcode||'').trim().slice(0,2);
    const n = parseInt(digits,10);
    if(isNaN(n)) return null;
    if(n>=87 && n<=91) return 'sabah';
    if(n>=93 && n<=98) return 'sarawak';
    return 'semenanjung';
  }
  function guessStateFromPostcode(postcode){
    const n = parseInt(String(postcode||'').trim().slice(0,2),10);
    if(isNaN(n)) return '';
    if(n>=1 && n<=2) return 'Perlis';
    if(n>=5 && n<=9) return 'Kedah';
    if(n>=10 && n<=14) return 'Pulau Pinang';
    if(n>=15 && n<=18) return 'Kelantan';
    if(n>=20 && n<=24) return 'Terengganu';
    if((n>=25 && n<=28) || n===39) return 'Pahang';
    if(n>=30 && n<=36) return 'Perak';
    if((n>=40 && n<=48) || n===63 || n===68) return 'Selangor';
    if((n>=50 && n<=60) || (n>=53 && n<=59)) return 'WP Kuala Lumpur';
    if(n===62) return 'WP Putrajaya';
    if(n>=70 && n<=73) return 'Negeri Sembilan';
    if(n>=75 && n<=78) return 'Melaka';
    if(n>=79 && n<=86) return 'Johor';
    if(n===87) return 'WP Labuan';
    if(n>=88 && n<=91) return 'Sabah';
    if(n>=93 && n<=98) return 'Sarawak';
    return '';
  }
  function calcShipping(zone, weightKg){
    const rows = (state.settings.shippingRates[zone]||[]).slice().sort((a,b)=>a.minKg-b.minKg);
    if(!rows.length) return 0;
    for(const r of rows){
      const max = (r.maxKg===null || r.maxKg===undefined) ? Infinity : r.maxKg;
      if(weightKg >= r.minKg && weightKg <= max) return r.rate;
    }
    const last = rows[rows.length-1];
    if(weightKg > last.maxKg) return last.rate;
    return rows[0].rate;
  }
  function findProduct(id){ return state.products.find(p=>p.id===id); }
  function cartLineTotal(line){
    const p = findProduct(line.productId);
    if(!p) return 0;
    return p.price * line.qty;
  }
  function cartTotalWeight(){
    return state.cart.reduce((sum,line)=>{
      const p = findProduct(line.productId);
      return sum + (p ? p.weight * line.qty : 0);
    },0);
  }
  function cartSubtotal(){
    return state.cart.reduce((sum,line)=>sum+cartLineTotal(line),0);
  }
  function cartCount(){ return state.cart.reduce((s,l)=>s+l.qty,0); }

  /* ================= NAV ================= */
  function openPanel(id){ document.getElementById(id).classList.add('open'); }
  function closePanel(id){ document.getElementById(id).classList.remove('open'); }
  function closeAllPanels(){
    ['detailPanel','cartPanel','checkoutPanel','confirmPanel','trackPanel','adminPanel'].forEach(closePanel);
  }
  document.querySelectorAll('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=> closePanel(btn.getAttribute('data-close')));
  });
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const nav = btn.getAttribute('data-nav');
      if(nav==='store'){ closeAllPanels(); }
      if(nav==='cart'){ renderCart(); openPanel('cartPanel'); }
      if(nav==='track'){ renderTrack(); openPanel('trackPanel'); }
      if(nav==='admin'){ renderAdmin(); openPanel('adminPanel'); }
    });
  });
  document.getElementById('cartBtn').addEventListener('click', ()=>{ renderCart(); openPanel('cartPanel'); });

  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  searchInput.addEventListener('input', ()=>{
    state.searchQuery = searchInput.value;
    searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderCatalog();
  });
  searchClearBtn.addEventListener('click', ()=>{
    searchInput.value = '';
    state.searchQuery = '';
    searchClearBtn.style.display = 'none';
    renderCatalog();
    searchInput.focus();
  });

  function updateCartBadge(){
    const badge = document.getElementById('cartBadge');
    const c = cartCount();
    if(c>0){ badge.style.display='flex'; badge.textContent = c; }
    else { badge.style.display='none'; }
  }

  /* ================= RENDER: PROMO VIDEO BANNER ================= */
  let promoCarouselTimer = null;
  function getYoutubeEmbedUrl(url){
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=0` : null;
  }
  function renderPromoVideo(){
    const wrap = document.getElementById('promoVideoWrap');
    // Padam timer carousel lama dulu setiap kali render (elak berbilang timer
    // bertindih bila renderPromoVideo dipanggil semula, cth lepas Simpan Tetapan)
    if(promoCarouselTimer){ clearInterval(promoCarouselTimer); promoCarouselTimer = null; }
    if(state.settings.promoVideoType==='upload' && state.settings.promoVideo){
      wrap.innerHTML = `<div class="promo-video-box"><video src="${state.settings.promoVideo}" controls playsinline muted loop></video></div>`;
    } else if(state.settings.promoVideoType==='url' && state.settings.promoVideoUrl){
      const yt = getYoutubeEmbedUrl(state.settings.promoVideoUrl);
      if(yt){
        wrap.innerHTML = `<div class="promo-video-box"><iframe src="${yt}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      } else {
        wrap.innerHTML = `<div class="promo-video-box"><video src="${escapeHtml(state.settings.promoVideoUrl)}" controls playsinline muted loop></video></div>`;
      }
    } else if(state.settings.promoVideoType==='image' && state.settings.promoImages && state.settings.promoImages.length){
      const imgs = state.settings.promoImages;
      const slidesHtml = imgs.map((im,i)=>`<img src="${im}" class="promo-carousel-slide${i===0?' active':''}" alt="Banner Promosi ${i+1}">`).join('');
      const dotsHtml = imgs.length>1
        ? `<div class="promo-carousel-dots">${imgs.map((_,i)=>`<span class="promo-dot${i===0?' active':''}"></span>`).join('')}</div>`
        : '';
      wrap.innerHTML = `<div class="promo-video-box promo-image-box promo-carousel" id="promoCarousel">${slidesHtml}${dotsHtml}</div>`;
      // Automatik tukar ke imej seterusnya setiap 3 saat (cuma bila ada >1 imej)
      if(imgs.length>1){
        let idx = 0;
        promoCarouselTimer = setInterval(()=>{
          const el = document.getElementById('promoCarousel');
          if(!el){ clearInterval(promoCarouselTimer); promoCarouselTimer = null; return; }
          idx = (idx+1) % imgs.length;
          el.querySelectorAll('.promo-carousel-slide').forEach((s,i)=>s.classList.toggle('active', i===idx));
          el.querySelectorAll('.promo-dot').forEach((d,i)=>d.classList.toggle('active', i===idx));
        }, 3000);
      }
    } else {
      wrap.innerHTML = '';
    }
  }

  /* ================= RENDER: CATEGORY BAR ================= */
  function renderCategoryBar(){
    const bar = document.getElementById('categoryBar');
    const chips = ['all', ...CATEGORIES];
    bar.innerHTML = chips.map(c=>{
      const label = c==='all' ? 'Semua' : c;
      const active = state.selectedCategory===c ? 'active' : '';
      return `<button type="button" class="category-chip ${active}" data-cat="${escapeHtml(c)}">${escapeHtml(label)}</button>`;
    }).join('');
    bar.querySelectorAll('.category-chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        state.selectedCategory = chip.getAttribute('data-cat');
        renderCategoryBar();
        renderCatalog();
      });
    });
  }

  /* ================= RENDER: CATALOG ================= */
  function renderCatalog(){
    document.getElementById('storeNameDisplay').textContent = state.settings.storeName || 'Kedai Saya';
    const logoImg = document.getElementById('storeLogoImg');
    if(logoImg){
      if(state.settings.storeLogo){ logoImg.src = state.settings.storeLogo; logoImg.style.display='block'; }
      else { logoImg.style.display='none'; }
    }
    const el = document.getElementById('catalogView');
    let filtered = state.selectedCategory==='all' ? state.products : state.products.filter(p=>p.category===state.selectedCategory);
    const q = state.searchQuery.trim().toLowerCase();
    if(q){
      filtered = filtered.filter(p=>p.name.toLowerCase().includes(q));
    }
    if(!filtered.length){
      el.innerHTML = state.products.length
        ? `<div class="empty-state"><div class="icon">🔍</div><div>${q ? 'Tiada produk sepadan dengan carian.' : 'Tiada produk dalam kategori ini.'}</div></div>`
        : '<div class="empty-state"><div class="icon">🛍️</div><div>Belum ada produk lagi.<br>Sila tambah produk di Login.</div></div>';
      return;
    }
    el.innerHTML = filtered.map(p=>{
      const img = (p.images && p.images[0]) ? `<img src="${p.images[0]}" alt="${escapeHtml(p.name)}">` : '<div class="no-img">Tiada gambar</div>';
      const stockVal = p.stock!=null ? p.stock : 0;
      const outOfStock = stockVal<=0;
      const stockHtml = outOfStock
        ? `<div class="stock-tag" style="color:var(--danger);font-weight:600;">Habis Stok</div>`
        : `<div class="stock-tag" style="color:var(--text-muted);font-size:12px;">Baki stok: ${stockVal}</div>`;
      return `
      <div class="product-card ${outOfStock?'out-of-stock':''}" data-product-id="${p.id}">
        <div class="img-wrap">${img}${outOfStock?'<div class="oos-overlay">Habis Stok</div>':''}</div>
        <div class="info">
          <div class="name">${escapeHtml(p.name)}</div>
          <div class="price-tag">${money(p.price)}</div>
          ${stockHtml}
        </div>
      </div>`;
    }).join('');
    el.querySelectorAll('.product-card').forEach(node=>{
      node.addEventListener('click', ()=>{
        const id = node.getAttribute('data-product-id');
        openProductDetail(id);
      });
    });
  }

  /* ================= RENDER: PRODUCT DETAIL ================= */
  function openProductDetail(id){
    const p = findProduct(id);
    if(!p) return;
    state.detailProduct = p;
    state.detailImgIndex = 0;
    state.detailQty = 1;
    state.detailVariant = (p.variants && p.variants.length) ? null : 'none';
    renderDetail();
    openPanel('detailPanel');
  }
  function renderDetail(){
    const p = state.detailProduct;
    if(!p) return;
    document.getElementById('detailPanelTitle').textContent = p.name;
    const images = (p.images && p.images.length) ? p.images : [];
    const mainImg = images[state.detailImgIndex] || images[0];
    // Gambar utama sekarang satu "laluan" (strip) yang boleh diswipe kiri-kanan
    // (guna scroll-snap CSS), bukan setakat imej statik yang bertukar bila tekan thumbnail.
    const slidesHtml = images.length
      ? images.map(im=>`<div class="detail-img-slide"><img src="${im}"></div>`).join('')
      : '';
    let thumbsHtml = '';
    if(images.length>1){
      thumbsHtml = '<div class="thumbs">' + images.map((im,i)=>
        `<img src="${im}" class="${i===state.detailImgIndex?'active':''}" data-idx="${i}">`
      ).join('') + '</div>';
    }
    let variantsHtml = '';
    if(p.variants && p.variants.length){
      variantsHtml = p.variants.map(v=>{
        const options = v.options.map(opt=>{
          const selected = state.detailVariant === (v.name+': '+opt);
          return `<button type="button" class="variant-chip ${selected?'selected':''}" data-variant-name="${escapeHtml(v.name)}" data-variant-opt="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`;
        }).join('');
        return `<div class="variant-group"><span class="field-label">${escapeHtml(v.name)}</span><div class="variant-options">${options}</div></div>`;
      }).join('');
    }
    const stockVal = p.stock!=null ? p.stock : 0;
    const outOfStock = stockVal<=0;
    const stockNoticeHtml = outOfStock
      ? `<div class="hint" style="color:var(--danger);font-weight:600;">Produk ini sedang habis stok.</div>`
      : `<div class="hint">Baki stok: ${stockVal}</div>`;
    // Gambar pertama dah dipaparkan sebagai cover/carousel di atas (mainImg + thumbs).
    // Gambar kedua dan seterusnya dipaparkan penuh (full-width) di bawah keterangan
    // produk — ini bagi ruang untuk gambar cara guna, testimoni, jenama, dll — supaya
    // pelanggan scroll terus untuk lihat lebih lanjut, macam listing Shopee/Lazada.
    const extraImages = images.slice(1);
    const extraImagesHtml = extraImages.length
      ? `<div class="detail-extra-gallery">${extraImages.map(im=>`<img src="${im}">`).join('')}</div>`
      : '';
    // Testimoni pelanggan diletak sebelum keterangan produk — bantu pelanggan
    // yang teragak-agak untuk beli, sama macam pengalaman belanja di platform
    // e-dagang popular (ulasan/testimoni ditunjuk awal, sebelum baca perincian penuh).
    const testimonialsHtml = (p.testimonials && p.testimonials.length)
      ? `<div class="testimonial-section">
          <div class="section-title" style="margin:0 0 10px;">Testimoni Pelanggan</div>
          ${p.testimonials.map(t=>`
            <div class="testimonial-card">
              <div class="testimonial-stars">${'⭐'.repeat(t.rating||5)}</div>
              <div class="testimonial-comment">${escapeHtml(t.comment)}</div>
              <div class="testimonial-name">— ${escapeHtml(t.name)}</div>
            </div>`).join('')}
        </div>`
      : '';
    document.getElementById('detailBody').innerHTML = `
      <div class="detail-img-scroll" id="detailImgScroll">${slidesHtml}</div>
      ${thumbsHtml}
      <div class="detail-name-row">
        <div class="detail-name">${escapeHtml(p.name)}</div>
        <button type="button" class="quick-add-btn" id="quickAddBtn" ${outOfStock?'disabled':''} title="Tambah ke troli">🛒</button>
      </div>
      <div class="detail-price">${money(p.price)} <span style="font-size:12px;color:var(--text-muted);font-weight:400;">(${p.weight}kg)</span></div>
      ${stockNoticeHtml}
      ${testimonialsHtml}
      <div class="detail-desc">${p.description||''}</div>
      ${extraImagesHtml}
      ${variantsHtml}
      <span class="field-label">Kuantiti</span>
      <div class="qty-row">
        <div class="qty-stepper">
          <button type="button" id="qtyMinus" ${outOfStock?'disabled':''}>−</button>
          <span id="qtyValue">${state.detailQty}</span>
          <button type="button" id="qtyPlus" ${outOfStock?'disabled':''}>+</button>
        </div>
      </div>
      <div style="margin-top:8px;"><button class="btn accent" id="addToCartBtn" style="width:100%;padding:13px;font-size:15px;" ${outOfStock?'disabled':''}>${outOfStock?'Habis Stok':`Tambah ke Troli — ${money(p.price*state.detailQty)}`}</button></div>
    `;
    const imgScroll = document.getElementById('detailImgScroll');
    if(imgScroll && state.detailImgIndex>0) imgScroll.scrollLeft = state.detailImgIndex * imgScroll.clientWidth;
    document.querySelectorAll('#detailBody .thumbs img').forEach(img=>{
      img.addEventListener('click', ()=>{
        const idx = parseInt(img.getAttribute('data-idx'),10);
        state.detailImgIndex = idx;
        if(imgScroll) imgScroll.scrollTo({left: idx * imgScroll.clientWidth, behavior:'smooth'});
        document.querySelectorAll('#detailBody .thumbs img').forEach(t=>t.classList.remove('active'));
        img.classList.add('active');
      });
    });
    if(imgScroll){
      let scrollTimeout;
      imgScroll.addEventListener('scroll', ()=>{
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(()=>{
          const idx = Math.round(imgScroll.scrollLeft / imgScroll.clientWidth);
          state.detailImgIndex = idx;
          document.querySelectorAll('#detailBody .thumbs img').forEach(t=>{
            t.classList.toggle('active', parseInt(t.getAttribute('data-idx'),10)===idx);
          });
        }, 100);
      });
    }
    document.querySelectorAll('#detailBody .variant-chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const name = chip.getAttribute('data-variant-name');
        const opt = chip.getAttribute('data-variant-opt');
        state.detailVariant = name+': '+opt;
        renderDetail();
      });
    });
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    if(qtyMinus) qtyMinus.addEventListener('click', ()=>{ if(state.detailQty>1){ state.detailQty--; renderDetail(); }});
    if(qtyPlus) qtyPlus.addEventListener('click', ()=>{
      if(state.detailQty < stockVal){ state.detailQty++; renderDetail(); }
      else { toast('Kuantiti melebihi baki stok'); }
    });
    const addBtn = document.getElementById('addToCartBtn');
    if(addBtn) addBtn.addEventListener('click', async ()=>{
      if(outOfStock) return;
      if(p.variants && p.variants.length && !state.detailVariant){
        toast('Sila pilih variasi produk');
        return;
      }
      const existing = state.cart.find(l=>l.productId===p.id && l.variantLabel===(state.detailVariant||'none'));
      const existingQty = existing ? existing.qty : 0;
      if(existingQty + state.detailQty > stockVal){
        toast(`Baki stok cuma ${stockVal}, anda dah ada ${existingQty} dalam troli`);
        return;
      }
      if(existing){ existing.qty += state.detailQty; }
      else { state.cart.push({productId:p.id, variantLabel: state.detailVariant||'none', qty: state.detailQty}); }
      await saveCart();
      updateCartBadge();
      toast('Ditambah ke troli');
      closePanel('detailPanel');
    });
    // Butang cepat sebelah nama produk — untuk pelanggan yang nak terus beli
    // tanpa scroll baca description/pilih kuantiti. Sentiasa tambah 1 unit,
    // tak kira apa nilai kuantiti di stepper bawah (yang tu untuk butang penuh).
    const quickAddBtn = document.getElementById('quickAddBtn');
    if(quickAddBtn) quickAddBtn.addEventListener('click', async ()=>{
      if(outOfStock) return;
      if(p.variants && p.variants.length && !state.detailVariant){
        toast('Sila pilih variasi produk dulu');
        return;
      }
      const existing = state.cart.find(l=>l.productId===p.id && l.variantLabel===(state.detailVariant||'none'));
      const existingQty = existing ? existing.qty : 0;
      if(existingQty + 1 > stockVal){
        toast(`Baki stok cuma ${stockVal}, anda dah ada ${existingQty} dalam troli`);
        return;
      }
      if(existing){ existing.qty += 1; }
      else { state.cart.push({productId:p.id, variantLabel: state.detailVariant||'none', qty: 1}); }
      await saveCart();
      updateCartBadge();
      toast('Ditambah ke troli');
      closePanel('detailPanel');
    });
  }

  /* ================= RENDER: CART ================= */
  function renderCart(){
    const el = document.getElementById('cartBody');
    if(!state.cart.length){
      el.innerHTML = '<div class="empty-state"><div class="icon">🛒</div>Troli anda kosong.</div>';
      return;
    }
    const rows = state.cart.map((line,idx)=>{
      const p = findProduct(line.productId);
      if(!p) return '';
      const img = (p.images && p.images[0]) ? `<img src="${p.images[0]}">` : `<div style="width:64px;height:64px;border-radius:8px;background:#F1ECDF;flex-shrink:0;"></div>`;
      const variantText = line.variantLabel && line.variantLabel!=='none' ? line.variantLabel : '';
      return `
      <div class="cart-item" data-idx="${idx}">
        ${img}
        <div class="ci-info">
          <div class="ci-name">${escapeHtml(p.name)}</div>
          ${variantText?`<div class="ci-variant">${escapeHtml(variantText)}</div>`:''}
          <div class="ci-bottom">
            <div class="qty-stepper">
              <button type="button" class="cart-qty-minus" data-idx="${idx}">−</button>
              <span>${line.qty}</span>
              <button type="button" class="cart-qty-plus" data-idx="${idx}">+</button>
            </div>
            <div class="price-tag">${money(cartLineTotal(line))}</div>
          </div>
          <button type="button" class="remove-link" data-idx="${idx}">Buang</button>
        </div>
      </div>`;
    }).join('');
    const subtotal = cartSubtotal();
    const weight = cartTotalWeight();
    el.innerHTML = rows + `
      <div class="summary-box">
        <div class="summary-row"><span>Jumlah berat</span><span>${weight.toFixed(2)} kg</span></div>
        <div class="summary-row total"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="hint">Kos penghantaran dikira semasa checkout ikut poskod & berat.</div>
      </div>
      <div class="sticky-cta"><button class="btn accent" id="toCheckoutBtn">Teruskan ke Checkout</button></div>
    `;
    el.querySelectorAll('.cart-qty-plus').forEach(b=>b.addEventListener('click', async ()=>{
      const i = parseInt(b.getAttribute('data-idx'),10);
      const line = state.cart[i];
      const p = findProduct(line.productId);
      const stockVal = p && p.stock!=null ? p.stock : 0;
      if(line.qty >= stockVal){ toast(`Baki stok cuma ${stockVal}`); return; }
      line.qty++; await saveCart(); updateCartBadge(); renderCart();
    }));
    el.querySelectorAll('.cart-qty-minus').forEach(b=>b.addEventListener('click', async ()=>{
      const i = parseInt(b.getAttribute('data-idx'),10);
      if(state.cart[i].qty>1) state.cart[i].qty--; else state.cart.splice(i,1);
      await saveCart(); updateCartBadge(); renderCart();
    }));
    el.querySelectorAll('.remove-link').forEach(b=>b.addEventListener('click', async ()=>{
      const i = parseInt(b.getAttribute('data-idx'),10); state.cart.splice(i,1);
      await saveCart(); updateCartBadge(); renderCart();
    }));
    const toCheckout = document.getElementById('toCheckoutBtn');
    if(toCheckout) toCheckout.addEventListener('click', ()=>{ renderCheckout(); openPanel('checkoutPanel'); });
  }

  /* ================= RENDER: CHECKOUT ================= */
  let checkoutReceiptData = null;
  function renderCheckout(){
    checkoutReceiptData = null;
    const el = document.getElementById('checkoutBody');
    const subtotal = cartSubtotal();
    const weight = cartTotalWeight();
    const hasSavedProfile = !!loadCustomerProfile();
    el.innerHTML = `
      ${hasSavedProfile ? '<div class="hint" style="margin-bottom:10px;">📌 Maklumat anda dari pesanan lepas diisi automatik. <button type="button" id="clearProfileBtn" style="background:none;border:none;color:var(--danger);text-decoration:underline;font-size:12px;cursor:pointer;padding:0;">Padam & isi baru</button></div>' : ''}
      <div class="form-group"><span class="field-label">Nama Penuh</span><input type="text" id="custName" placeholder="Nama anda"></div>
      <div class="form-group"><span class="field-label">No. Telefon</span><input type="tel" id="custPhone" placeholder="0123456789"></div>
      <div class="form-group"><span class="field-label">Alamat Penghantaran</span><textarea id="custAddress" placeholder="Alamat penuh"></textarea></div>
      <div class="form-group"><span class="field-label">Bandar</span><input type="text" id="custCity" placeholder="Cth: Kangar"></div>
      <div class="form-group"><span class="field-label">Poskod</span><input type="text" id="custPostcode" inputmode="numeric" maxlength="5" placeholder="Cth: 05000"></div>
      <div class="form-group"><span class="field-label" id="custEmailLabel">Email (pilihan — untuk terima notifikasi pesanan)</span><input type="email" id="custEmail" placeholder="nama@email.com"></div>
      <div id="shippingResult"></div>
      <div class="summary-box">
        <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-row"><span>Jumlah berat</span><span>${weight.toFixed(2)} kg</span></div>
        <div class="summary-row"><span>Penghantaran</span><span id="shipCostDisplay">—</span></div>
        <div class="summary-row total"><span>Jumlah Bayar</span><span id="grandTotalDisplay">${money(subtotal)}</span></div>
      </div>

      <div class="section-title">Bayaran</div>
      <div id="qrSection"></div>

      <div class="section-title">Kaedah Bayaran</div>
      <div class="payment-method-row">
        <label class="payment-method-option"><input type="radio" name="paymentMethod" id="pmManual" value="manual" checked> Upload Resit (QR/Transfer Bank)</label>
        <label class="payment-method-option"><input type="radio" name="paymentMethod" id="pmBillplz" value="billplz"> Bayar Online Terus (FPX/Kad)</label>
      </div>

      <div id="manualPaymentSection">
        <div class="section-title">Upload Resit Bayaran</div>
        <div class="upload-box">
          <div id="receiptPromptText">Ketik untuk upload gambar resit</div>
          <img id="receiptPreview" class="upload-preview" style="display:none;">
          <input type="file" accept="image/*,application/pdf" id="receiptInput">
        </div>
      </div>
      <div id="billplzPaymentSection" style="display:none;">
        <div class="hint">Selepas tekan "Teruskan ke Pembayaran", anda akan diarah ke laman pembayaran selamat Billplz (FPX/kad kredit-debit). Pesanan disahkan automatik selepas bayaran berjaya.</div>
      </div>

      <div style="margin-top:8px;"><button class="btn accent" id="submitOrderBtn" style="width:100%;padding:13px;font-size:15px;">Hantar Pesanan</button></div>
    `;
    const postcodeInput = document.getElementById('custPostcode');
    const savedProfile = loadCustomerProfile();
    if(savedProfile){
      document.getElementById('custName').value = savedProfile.name || '';
      document.getElementById('custPhone').value = savedProfile.phone || '';
      document.getElementById('custAddress').value = savedProfile.address || '';
      document.getElementById('custCity').value = savedProfile.city || '';
      postcodeInput.value = savedProfile.postcode || '';
      document.getElementById('custEmail').value = savedProfile.email || '';
    }
    let currentShipCost = null;
    function updateShipping(){
      const pc = postcodeInput.value.trim();
      const zone = getZone(pc);
      const shipDisplay = document.getElementById('shipCostDisplay');
      const grandDisplay = document.getElementById('grandTotalDisplay');
      const resultBox = document.getElementById('shippingResult');
      if(pc.length<5 || !zone){
        resultBox.innerHTML = '';
        shipDisplay.textContent = '—';
        grandDisplay.textContent = money(subtotal);
        currentShipCost = null;
        return;
      }
      const cost = calcShipping(zone, weight);
      currentShipCost = cost;
      resultBox.innerHTML = `<div class="hint">Zon dikesan: <strong>${ZONE_LABELS[zone]}</strong></div>`;
      shipDisplay.textContent = money(cost);
      grandDisplay.textContent = money(subtotal+cost);
    }
    postcodeInput.addEventListener('input', updateShipping);
    if(savedProfile && savedProfile.postcode) updateShipping();

    const clearProfileBtn = document.getElementById('clearProfileBtn');
    if(clearProfileBtn) clearProfileBtn.addEventListener('click', ()=>{
      localStorage.removeItem('cktglobal_customer_profile');
      renderCheckout();
    });

    // QR section
    const qrSection = document.getElementById('qrSection');
    if(state.settings.qrImage){
      qrSection.innerHTML = `<div class="qr-box">
        <img src="${state.settings.qrImage}" id="checkoutQrImg">
        <div class="qr-caption">Imbas kod QR ini untuk bayar, kemudian upload resit di bawah.</div>
        <div class="hint" style="font-weight:600;color:var(--text);margin-top:8px;">📌 Tekan &amp; tahan gambar QR di atas, kemudian pilih "Simpan Imej" untuk simpan ke galeri telefon anda.</div>
      </div>`;
    } else {
      qrSection.innerHTML = `<div class="qr-box"><div class="qr-caption">QR bank belum ditetapkan oleh admin.</div></div>`;
    }

    // Receipt upload
    const pmManual = document.getElementById('pmManual');
    const pmBillplz = document.getElementById('pmBillplz');
    const manualSection = document.getElementById('manualPaymentSection');
    const billplzSection = document.getElementById('billplzPaymentSection');
    const submitBtnLabel = document.getElementById('submitOrderBtn');
    function updatePaymentMethodUI(){
      const isBillplz = pmBillplz.checked;
      manualSection.style.display = isBillplz ? 'none' : 'block';
      billplzSection.style.display = isBillplz ? 'block' : 'none';
      submitBtnLabel.textContent = isBillplz ? 'Teruskan ke Pembayaran' : 'Hantar Pesanan';
      document.getElementById('custEmailLabel').textContent = isBillplz
        ? 'Email (wajib untuk bayaran online)'
        : 'Email (pilihan — untuk terima notifikasi pesanan)';
    }
    pmManual.addEventListener('change', updatePaymentMethodUI);
    pmBillplz.addEventListener('change', updatePaymentMethodUI);

    const receiptInput = document.getElementById('receiptInput');
    receiptInput.addEventListener('change', async (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      const allowed = ['image/jpeg','image/jpg','image/png','image/webp','application/pdf'];
      if(!allowed.includes(file.type)){
        toast('Sila upload fail JPEG, PNG atau PDF sahaja');
        e.target.value = '';
        return;
      }
      const prev = document.getElementById('receiptPreview');
      const promptText = document.getElementById('receiptPromptText');
      if(file.type === 'application/pdf'){
        // PDFs can't go through the canvas resize path — read as-is
        const dataUrl = await new Promise((resolve,reject)=>{
          const reader = new FileReader();
          reader.onload = ()=>resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        checkoutReceiptData = dataUrl;
        prev.style.display = 'none';
        promptText.textContent = `Resit (PDF) dipilih ✓: ${file.name} (ketik untuk tukar)`;
      } else {
        const dataUrl = await resizeImage(file, 700);
        checkoutReceiptData = dataUrl;
        promptText.textContent = 'Resit dipilih ✓ (ketik untuk tukar)';
        prev.src = dataUrl; prev.style.display='block';
      }
    });

    document.getElementById('submitOrderBtn').addEventListener('click', async ()=>{
      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      const city = document.getElementById('custCity').value.trim();
      const postcode = postcodeInput.value.trim();
      const email = document.getElementById('custEmail').value.trim();
      const zone = getZone(postcode);
      if(!name || !phone || !address || !city || !postcode || !zone){
        toast('Sila lengkapkan semua maklumat & poskod yang sah');
        return;
      }
      if(currentShipCost===null) updateShipping();
      if(currentShipCost===null){ toast('Poskod tidak sah'); return; }
      const paymentMethod = pmBillplz.checked ? 'billplz' : 'manual';
      if(paymentMethod==='manual' && !checkoutReceiptData){
        toast('Sila upload resit bayaran');
        return;
      }
      if(paymentMethod==='billplz' && !email){
        toast('Emel diperlukan untuk bayaran online (Billplz) — sila isi emel anda');
        return;
      }
      const items = state.cart.map(line=>{
        const p = findProduct(line.productId);
        return {productId:line.productId, name:p?p.name:'—', variantLabel:line.variantLabel, qty:line.qty, price:p?p.price:0};
      });
      // Semak sekali lagi baki stok sebelum hantar — elak overselling kalau troli
      // dibiar lama terbuka dan stok dah berubah (contoh admin dah kemaskini/produk lain beli habiskannya)
      for(const line of state.cart){
        const p = findProduct(line.productId);
        const stockVal = p && p.stock!=null ? p.stock : 0;
        if(!p || line.qty > stockVal){
          toast(`Stok "${p?p.name:'produk'}" tidak mencukupi (baki: ${stockVal}). Sila kemaskini troli anda.`);
          return;
        }
      }
      const order = {
        id: uid('order'),
        createdAt: new Date().toISOString(),
        customer: {name, phone, phoneDigits: phone.replace(/\D/g,''), address, city, postcode, zone, email},
        items,
        weight,
        subtotal,
        shippingCost: currentShipCost,
        total: subtotal + currentShipCost,
        receiptImage: checkoutReceiptData,
        status: paymentMethod==='billplz' ? 'awaiting_payment' : 'pending',
        trackingNumber: '',
        paymentMethod
      };
      const submitBtn = document.getElementById('submitOrderBtn');
      submitBtn.disabled = true; submitBtn.textContent = 'Menghantar...';
      const result = await saveOrder(order);
      if(!result.ok){
        submitBtn.disabled = false; submitBtn.textContent = 'Hantar Pesanan';
        const errMsg = (result.error && result.error.message) ? result.error.message : (result.error || 'ralat tidak diketahui');
        toast(`Gagal hantar pesanan: ${errMsg} — sila cuba lagi`, 5000);
        return;
      }
      // Untuk pesanan Billplz (bayar online), JANGAN tolak stok sekarang — pelanggan
      // belum sahkan bayaran lagi (mungkin abandon di laman Billplz). Stok cuma
      // ditolak selepas webhook billplz-notification sahkan bayaran BERJAYA.
      // Untuk pesanan manual (upload resit), stok ditolak terus macam biasa
      // sebab upload resit dah jadi tanda niat bayaran yang lebih kukuh.
      if(paymentMethod !== 'billplz'){
        for(const line of state.cart){
          const p = findProduct(line.productId);
          if(!p) continue;
          const stockResult = await decrementStockRow(p.id, line.qty);
          if(stockResult.ok){
            p.stock = Math.max((p.stock||0) - line.qty, 0);
          }
        }
      }
      saveCustomerProfile({name, phone, address, city, postcode, email});
      sendTelegramNotification(orderTelegramMessage(order));
      addToMyOrders(order);
      state.cart = [];
      await saveCart();
      updateCartBadge();
      state.lastOrder = order;
      renderCatalog();

      if(paymentMethod === 'billplz'){
        submitBtn.textContent = 'Menyambung ke Billplz...';
        try{
          const res = await fetch(window.BILLPLZ_CREATE_PAYMENT_URL, {
            method: 'POST',
            headers: {
              'Content-Type':'application/json',
              'Authorization': 'Bearer ' + window.SUPABASE_ANON_KEY,
              'apikey': window.SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              orderId: order.id,
              amount: order.total,
              customerName: name,
              customerEmail: email,
              customerPhone: phone
            })
          });
          const data = await res.json();
          if(data.ok && data.paymentUrl){
            window.location.href = data.paymentUrl;
          } else {
            submitBtn.disabled = false; submitBtn.textContent = 'Teruskan ke Pembayaran';
            toast(`Gagal sambung ke Billplz: ${data.error||'ralat tidak diketahui'} — pesanan anda tetap disimpan, admin akan hubungi anda`, 5000);
          }
        } catch(err){
          submitBtn.disabled = false; submitBtn.textContent = 'Teruskan ke Pembayaran';
          toast('Gagal sambung ke Billplz — semak sambungan internet & cuba lagi', 4000);
        }
        return;
      }

      closePanel('checkoutPanel');
      renderConfirm(order);
      openPanel('confirmPanel');
    });
  }

  function renderConfirm(order){
    document.getElementById('confirmBody').innerHTML = `
      <div class="empty-state" style="padding:30px 10px;">
        <div class="icon">✅</div>
        <div style="font-weight:700;font-size:16px;margin-bottom:6px;">Terima kasih, ${escapeHtml(order.customer.name)}!</div>
        <div>Pesanan anda telah diterima dan sedang disemak.</div>
      </div>
      <div class="summary-box">
        <div class="summary-row"><span>No. Pesanan</span><span style="font-family:var(--font-mono);font-size:12px;">${order.id}</span></div>
        <div class="summary-row"><span>Zon</span><span>${ZONE_LABELS[order.customer.zone]}</span></div>
        <div class="summary-row"><span>Penghantaran</span><span>${money(order.shippingCost)}</span></div>
        <div class="summary-row total"><span>Jumlah Dibayar</span><span>${money(order.total)}</span></div>
      </div>
      <div class="sticky-cta" style="display:flex;gap:10px;">
        <button class="btn outline" id="trackThisOrderBtn" style="flex:1;">Jejak Pesanan Ini</button>
        <button class="btn" id="backToStoreBtn" style="flex:1;">Kembali ke Kedai</button>
      </div>
    `;
    document.getElementById('backToStoreBtn').addEventListener('click', ()=> closePanel('confirmPanel'));
    document.getElementById('trackThisOrderBtn').addEventListener('click', ()=>{
      closePanel('confirmPanel');
      renderTrack(order.id);
      openPanel('trackPanel');
    });
  }

  /* ================= RENDER: TRACK ORDER (customer) ================= */
  const STATUS_STEPS = ['pending','paid','shipped','completed'];
  const STATUS_STEP_LABELS = {pending:'Pesanan Diterima', paid:'Bayaran Disahkan', shipped:'Dihantar', completed:'Selesai'};
  function renderTrack(prefillId){
    const el = document.getElementById('trackBody');
    const myOrders = loadMyOrders();

    if(prefillId){
      // Dibuka terus dari butang "Jejak Pesanan Ini" selepas checkout
      renderTrackSearchForm(el, prefillId);
      return;
    }

    if(myOrders.length){
      const listHtml = myOrders.map(o=>`
        <div class="order-card" style="display:flex;align-items:center;gap:8px;padding:0;">
          <button type="button" class="my-order-view-btn" style="flex:1;text-align:left;border:none;background:none;cursor:pointer;padding:12px 14px;" data-order-id="${escapeHtml(o.id)}">
            <div class="oc-top"><span class="oc-name">${formatOrderDate(o.createdAt)}</span><span class="price-tag">${money(o.total)}</span></div>
            <div class="oc-id">${escapeHtml(o.id)}</div>
          </button>
          <button type="button" class="my-order-delete-btn" data-order-id="${escapeHtml(o.id)}" title="Padam dari senarai ini" style="background:none;border:none;color:var(--danger);font-size:17px;padding:0 14px;flex-shrink:0;">🗑️</button>
        </div>
      `).join('');
      el.innerHTML = `
        <div class="field-label" style="margin-bottom:8px;">Pesanan Anda</div>
        <div class="hint" style="margin-bottom:10px;">Tekan 🗑️ untuk padam pesanan dari senarai ini sahaja (tidak menjejaskan rekod sebenar di kedai).</div>
        ${listHtml}
        <button type="button" class="btn small outline" id="trackOtherBtn" style="width:100%;margin-top:12px;">Jejak No. Pesanan Lain</button>
        <div id="trackResult" style="margin-top:16px;"></div>
      `;
      el.querySelectorAll('.my-order-view-btn').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          renderTrackSearchForm(el, btn.getAttribute('data-order-id'));
        });
      });
      el.querySelectorAll('.my-order-delete-btn').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const id = btn.getAttribute('data-order-id');
          if(!confirm('Padam pesanan ini dari senarai "Pesanan Anda"? (Rekod sebenar di kedai tidak terjejas — anda masih boleh jejak semula guna No. Pesanan/No. Telefon)')) return;
          removeFromMyOrders(id);
          renderTrack();
        });
      });
      document.getElementById('trackOtherBtn').addEventListener('click', ()=>{
        renderTrackSearchForm(el, '');
      });
    } else {
      renderTrackSearchForm(el, '');
    }
  }

  function renderTrackSearchForm(el, prefillId){
    el.innerHTML = `
      <button type="button" class="btn small outline" id="backToMyOrdersBtn" style="margin-bottom:12px;">← Pesanan Anda</button>
      <div class="tabbar" style="padding:0 0 12px;">
        <button type="button" class="tab-btn active" data-searchmode="phone">Cari ikut No. Telefon</button>
        <button type="button" class="tab-btn" data-searchmode="id">Cari ikut No. Pesanan</button>
      </div>
      <div id="searchModeBody"></div>
    `;
    document.getElementById('backToMyOrdersBtn').addEventListener('click', ()=>{ renderTrack(); });
    const tabs = el.querySelectorAll('[data-searchmode]');
    function drawSearchMode(mode){
      tabs.forEach(t=>t.classList.toggle('active', t.getAttribute('data-searchmode')===mode));
      const body = document.getElementById('searchModeBody');
      if(mode==='phone'){
        body.innerHTML = `
          <div class="form-group"><span class="field-label">No. Telefon</span><input type="tel" id="trackPhoneInput" placeholder="Cth: 0123456789"></div>
          <button class="btn accent" id="trackPhoneBtn" style="width:100%;">Cari Pesanan Saya</button>
          <div class="hint" style="margin-top:6px;">Guna nombor telefon yang sama seperti semasa membuat pesanan.</div>
          <div id="trackResult" style="margin-top:16px;"></div>
        `;
        document.getElementById('trackPhoneBtn').addEventListener('click', doPhoneSearch);
        document.getElementById('trackPhoneInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doPhoneSearch(); });
      } else {
        body.innerHTML = `
          <div class="form-group"><span class="field-label">No. Pesanan</span><input type="text" id="trackOrderId" placeholder="Cth: order-abc123" value="${escapeHtml(prefillId||'')}"></div>
          <button class="btn accent" id="trackSearchBtn" style="width:100%;">Jejak Pesanan</button>
          <div id="trackResult" style="margin-top:16px;"></div>
        `;
        document.getElementById('trackSearchBtn').addEventListener('click', doTrackSearch);
        document.getElementById('trackOrderId').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doTrackSearch(); });
        if(prefillId) doTrackSearch();
      }
    }
    tabs.forEach(t=>t.addEventListener('click', ()=> drawSearchMode(t.getAttribute('data-searchmode'))));
    drawSearchMode(prefillId ? 'id' : 'phone');
  }

  async function doPhoneSearch(){
    const phoneInput = document.getElementById('trackPhoneInput');
    const phone = phoneInput.value.trim();
    const resultBox = document.getElementById('trackResult');
    if(!phone){ toast('Sila masukkan No. Telefon'); return; }
    resultBox.innerHTML = '<div class="empty-hint">Mencari...</div>';
    const orders = await fetchOrdersByPhone(phone);
    if(!orders.length){
      resultBox.innerHTML = '<div class="empty-hint">Tiada pesanan dijumpai dengan nombor telefon ini. Sila semak semula nombor yang digunakan semasa membuat pesanan.</div>';
      return;
    }
    orders.forEach(o=>addToMyOrders(o));
    resultBox.innerHTML = `
      <div class="field-label" style="margin-bottom:8px;">${orders.length} Pesanan Dijumpai</div>
      ${orders.map(o=>renderOrderSummaryCard(o)).join('')}
    `;
    resultBox.querySelectorAll('[data-view-order]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const targetOrder = orders.find(o=>o.id===btn.getAttribute('data-view-order'));
        if(targetOrder) renderOrderDetail(resultBox, targetOrder);
      });
    });
  }

  function renderOrderSummaryCard(o){
    return `
      <button type="button" class="order-card" style="width:100%;text-align:left;border:1px solid var(--border);cursor:pointer;margin-bottom:10px;" data-view-order="${escapeHtml(o.id)}">
        <div class="oc-top"><span class="oc-name">${formatOrderDate(o.createdAt)}</span><span class="status-pill status-${o.status}">${statusLabel(o.status)}</span></div>
        <div class="oc-id">${escapeHtml(o.id)}</div>
        <div class="oc-meta">Jumlah: <strong>${money(o.total)}</strong>${o.trackingNumber ? ' · No. Tracking ada' : ''}</div>
      </button>
    `;
  }

  function renderOrderDetail(container, order){
    localStorage.setItem('cktglobal_last_order_id', order.id);
    const currentIdx = STATUS_STEPS.indexOf(order.status);
    const stepsHtml = STATUS_STEPS.map((s,i)=>{
      const done = i<=currentIdx;
      return `<div class="summary-row"><span>${done?'✅':'⬜️'} ${STATUS_STEP_LABELS[s]}</span></div>`;
    }).join('');
    const itemsHtml = order.items.map(it=>`<div>${it.qty}× ${escapeHtml(it.name)}${it.variantLabel&&it.variantLabel!=='none'?' ('+escapeHtml(it.variantLabel)+')':''} — ${money(it.price*it.qty)}</div>`).join('');
    container.innerHTML = `
      <button type="button" class="btn small outline" id="backToListBtn" style="margin-bottom:12px;">← Senarai Pesanan</button>
      <div class="summary-box">
        <div class="summary-row"><span>No. Pesanan</span><span style="font-family:var(--font-mono);font-size:12px;">${order.id}</span></div>
        <div class="summary-row"><span>Tarikh & Masa</span><span>${formatOrderDate(order.createdAt)}</span></div>
        <div class="summary-row total"><span>Status Semasa</span><span class="status-pill status-${order.status}">${statusLabel(order.status)}</span></div>
      </div>
      <div class="summary-box">${stepsHtml}</div>
      <div class="summary-box">
        <div class="field-label" style="margin-bottom:8px;">Rekod Belian</div>
        <div class="oc-items" style="font-size:13.5px;line-height:1.6;">${itemsHtml}</div>
        <div class="summary-row" style="margin-top:8px;border-top:1px dashed var(--border);padding-top:8px;"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
        <div class="summary-row"><span>Penghantaran</span><span>${money(order.shippingCost)}</span></div>
        <div class="summary-row total"><span>Jumlah</span><span>${money(order.total)}</span></div>
      </div>
      ${order.trackingNumber ? `
      <div class="summary-box">
        <div class="field-label">No. Tracking Pos Laju</div>
        <div style="font-family:var(--font-mono);font-size:16px;font-weight:600;margin:6px 0;">${escapeHtml(order.trackingNumber)}</div>
        <button class="btn accent" id="openPosLajuBtn2" style="width:100%;">📦 Jejak di Laman Pos Laju</button>
        <button class="btn small outline" id="copyTrackingBtn2" style="width:100%;margin-top:8px;">Salin No. Tracking Sahaja</button>
        <div class="hint">No. tracking disalin automatik — tinggal tampal (paste) di laman Pos Laju yang terbuka.</div>
      </div>` : `<div class="empty-hint">📭 Pesanan anda masih dalam proses — <strong>belum dihantar/dipos lagi</strong>. No. tracking akan dipaparkan di sini sebaik sahaja admin kemas kini.</div>`}
      <button type="button" class="btn small outline" id="removeFromMyOrdersBtn2" style="width:100%;margin-top:14px;color:var(--danger);border-color:var(--danger);">🗑️ Padam Pesanan Ini Dari Senarai Peranti Saya</button>
    `;
    document.getElementById('backToListBtn').addEventListener('click', doPhoneSearch);
    document.getElementById('removeFromMyOrdersBtn2').addEventListener('click', ()=>{
      if(!confirm('Padam pesanan ini dari senarai peranti anda? Rekod sebenar di kedai tidak terjejas — anda masih boleh jejak semula guna No. Pesanan/No. Telefon.')) return;
      removeFromMyOrders(order.id);
      toast('Dipadam dari senarai peranti anda');
      doPhoneSearch();
    });
    const copyBtn2 = document.getElementById('copyTrackingBtn2');
    if(copyBtn2) copyBtn2.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(order.trackingNumber); toast('No. tracking disalin'); }
      catch(e){ toast('Tidak dapat menyalin — sila salin secara manual'); }
    });
    const openBtn2 = document.getElementById('openPosLajuBtn2');
    if(openBtn2) openBtn2.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(order.trackingNumber); toast('No. tracking disalin — tampal di laman Pos Laju'); }
      catch(e){ /* teruskan walaupun gagal salin */ }
      window.open('https://tracking.pos.com.my/tracking/', '_blank', 'noopener');
    });
  }
  async function doTrackSearch(){
    const idInput = document.getElementById('trackOrderId');
    const id = idInput.value.trim();
    const resultBox = document.getElementById('trackResult');
    if(!id){ toast('Sila masukkan No. Pesanan'); return; }
    resultBox.innerHTML = '<div class="empty-hint">Mencari...</div>';
    delete state.ordersCache[id]; // pastikan sentiasa ambil status & tracking terkini, bukan cache lama
    const order = await fetchOrder(id);
    if(!order){
      resultBox.innerHTML = '<div class="empty-hint">Pesanan tidak dijumpai. Sila semak semula No. Pesanan.</div>';
      return;
    }
    localStorage.setItem('cktglobal_last_order_id', order.id);
    addToMyOrders(order);
    const currentIdx = STATUS_STEPS.indexOf(order.status);
    const stepsHtml = STATUS_STEPS.map((s,i)=>{
      const done = i<=currentIdx;
      return `<div class="summary-row"><span>${done?'✅':'⬜️'} ${STATUS_STEP_LABELS[s]}</span></div>`;
    }).join('');
    const itemsHtml = order.items.map(it=>`<div>${it.qty}× ${escapeHtml(it.name)}${it.variantLabel&&it.variantLabel!=='none'?' ('+escapeHtml(it.variantLabel)+')':''} — ${money(it.price*it.qty)}</div>`).join('');
    resultBox.innerHTML = `
      <div class="summary-box">
        <div class="summary-row"><span>No. Pesanan</span><span style="font-family:var(--font-mono);font-size:12px;">${order.id}</span></div>
        <div class="summary-row"><span>Tarikh & Masa</span><span>${formatOrderDate(order.createdAt)}</span></div>
        <div class="summary-row total"><span>Status Semasa</span><span class="status-pill status-${order.status}">${statusLabel(order.status)}</span></div>
      </div>
      <div class="summary-box">${stepsHtml}</div>
      <div class="summary-box">
        <div class="field-label" style="margin-bottom:8px;">Rekod Belian</div>
        <div class="oc-items" style="font-size:13.5px;line-height:1.6;">${itemsHtml}</div>
        <div class="summary-row" style="margin-top:8px;border-top:1px dashed var(--border);padding-top:8px;"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
        <div class="summary-row"><span>Penghantaran</span><span>${money(order.shippingCost)}</span></div>
        <div class="summary-row total"><span>Jumlah</span><span>${money(order.total)}</span></div>
      </div>
      ${order.trackingNumber ? `
      <div class="summary-box">
        <div class="field-label">No. Tracking Pos Laju</div>
        <div style="font-family:var(--font-mono);font-size:16px;font-weight:600;margin:6px 0;">${escapeHtml(order.trackingNumber)}</div>
        <button class="btn accent" id="openPosLajuBtn" style="width:100%;">📦 Jejak di Laman Pos Laju</button>
        <button class="btn small outline" id="copyTrackingBtn" style="width:100%;margin-top:8px;">Salin No. Tracking Sahaja</button>
        <div class="hint">No. tracking disalin automatik — tinggal tampal (paste) di laman Pos Laju yang terbuka.</div>
      </div>` : `<div class="empty-hint">📭 Pesanan anda masih dalam proses — <strong>belum dihantar/dipos lagi</strong>. No. tracking akan dipaparkan di sini sebaik sahaja admin kemas kini.</div>`}
      <button type="button" class="btn small outline" id="removeFromMyOrdersBtn" style="width:100%;margin-top:14px;color:var(--danger);border-color:var(--danger);">🗑️ Padam Pesanan Ini Dari Senarai Peranti Saya</button>
    `;
    const copyBtn = document.getElementById('copyTrackingBtn');
    if(copyBtn) copyBtn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(order.trackingNumber); toast('No. tracking disalin'); }
      catch(e){ toast('Tidak dapat menyalin — sila salin secara manual'); }
    });
    const openBtn = document.getElementById('openPosLajuBtn');
    if(openBtn) openBtn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(order.trackingNumber); toast('No. tracking disalin — tampal di laman Pos Laju'); }
      catch(e){ /* teruskan walaupun gagal salin */ }
      window.open('https://tracking.pos.com.my/tracking/', '_blank', 'noopener');
    });
    document.getElementById('removeFromMyOrdersBtn').addEventListener('click', ()=>{
      if(!confirm('Padam pesanan ini dari senarai peranti anda? Rekod sebenar di kedai tidak terjejas — anda masih boleh jejak semula guna No. Pesanan/No. Telefon.')) return;
      removeFromMyOrders(order.id);
      toast('Dipadam dari senarai peranti anda');
      idInput.value = '';
      resultBox.innerHTML = '';
    });
  }

  /* ================= ADMIN ================= */
  let adminTab = 'products';
  function renderAdmin(){
    const el = document.getElementById('adminBody');
    if(!state.adminUnlocked){
      const headerActionsLocked = document.getElementById('adminHeaderActions');
      if(headerActionsLocked) headerActionsLocked.innerHTML = '';
      el.innerHTML = `
        <div class="admin-login">
          <div style="font-size:32px;">🔒</div>
          <div style="margin:8px 0 4px;font-weight:600;">Masukkan PIN Login</div>
          <input type="password" id="adminPinInput" inputmode="numeric" maxlength="8" placeholder="••••">
          <div><button class="btn" id="adminUnlockBtn">Login</button></div>
        </div>`;
      document.getElementById('adminUnlockBtn').addEventListener('click', ()=>{
        const val = document.getElementById('adminPinInput').value;
        if(val === state.settings.adminPin){
          state.adminUnlocked = true;
          renderAdmin();
        } else {
          toast('PIN salah');
        }
      });
      return;
    }
    el.innerHTML = `
      <div class="tabbar" id="adminTabbar">
        <button class="tab-btn ${adminTab==='products'?'active':''}" data-tab="products">Produk</button>
        <button class="tab-btn ${adminTab==='shipping'?'active':''}" data-tab="shipping">Penghantaran</button>
        <button class="tab-btn ${adminTab==='orders'?'active':''}" data-tab="orders">Pesanan</button>
        <button class="tab-btn ${adminTab==='settings'?'active':''}" data-tab="settings">Tetapan</button>
      </div>
      <div id="adminTabContent" style="padding-top:14px;"></div>
    `;
    const headerActions = document.getElementById('adminHeaderActions');
    if(headerActions){
      headerActions.innerHTML = `<button type="button" class="btn small outline" id="adminLogoutBtn" style="background:rgba(255,255,255,0.14);color:#fff;border-color:rgba(255,255,255,0.4);">🔒 Logout</button>`;
      document.getElementById('adminLogoutBtn').addEventListener('click', ()=>{
        state.adminUnlocked = false;
        adminTab = 'products';
        renderAdmin();
        toast('Logout berjaya');
      });
    }
    el.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click', ()=>{
      adminTab = b.getAttribute('data-tab');
      renderAdmin();
    }));
    const content = document.getElementById('adminTabContent');
    if(adminTab==='products') renderAdminProducts(content);
    if(adminTab==='shipping') renderAdminShipping(content);
    if(adminTab==='orders') renderAdminOrders(content);
    if(adminTab==='settings') renderAdminSettings(content);
  }

  /* --- Admin: Products --- */
  function renderAdminProducts(content, editingProduct){
    const editing = editingProduct !== undefined ? editingProduct : null;
    if(editing){
      renderProductForm(content, editing);
      return;
    }
    const listHtml = state.products.length ? state.products.map(p=>{
      const img = (p.images && p.images[0]) ? `<img src="${p.images[0]}">` : `<div style="width:52px;height:52px;border-radius:8px;background:#F1ECDF;flex-shrink:0;"></div>`;
      const stockVal = p.stock!=null ? p.stock : 0;
      const stockLabel = stockVal<=0
        ? `<span style="color:var(--danger);font-weight:600;">Stok: 0 (Habis)</span>`
        : `Stok: ${stockVal}`;
      return `
      <div class="admin-product-row">
        ${img}
        <div class="apr-info">
          <div class="apr-name">${escapeHtml(p.name)}</div>
          <div class="apr-meta">${money(p.price)} · ${p.weight}kg · ${escapeHtml(p.category||'Lain-Lain')} · ${stockLabel}</div>
        </div>
        <div class="admin-actions">
          <button class="icon-mini-btn" data-edit="${p.id}">✏️</button>
          <button class="icon-mini-btn" data-del="${p.id}">🗑️</button>
        </div>
      </div>`;
    }).join('') : '<div class="empty-hint">Belum ada produk. Tambah produk pertama anda.</div>';
    content.innerHTML = `
      <button class="btn accent" id="newProductBtn" style="width:100%;margin-bottom:14px;">+ Tambah Produk</button>
      ${listHtml}
    `;
    document.getElementById('newProductBtn').addEventListener('click', ()=> renderAdminProducts(content, {}));
    content.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click', ()=>{
      const p = findProduct(b.getAttribute('data-edit'));
      renderAdminProducts(content, p);
    }));
    content.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', async ()=>{
      if(!confirm('Padam produk ini?')) return;
      const delId = b.getAttribute('data-del');
      const result = await deleteProductRow(delId);
      if(!result.ok){
        toast('Gagal padam — semak sambungan Supabase');
        return;
      }
      state.products = state.products.filter(p=>p.id!==delId);
      renderAdminProducts(content);
      renderCatalog();
    }));
  }

  function renderProductForm(content, p){
    const isNew = !p.id;
    const images = p.images ? p.images.slice() : [];
    let variants = p.variants ? JSON.parse(JSON.stringify(p.variants)) : [];
    let testimonials = p.testimonials ? JSON.parse(JSON.stringify(p.testimonials)) : [];

    function draw(){
      const imgThumbs = images.map((im,i)=>`
        <div style="position:relative;display:inline-block;margin:0 6px 6px 0;">
          <img src="${im}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
          <button type="button" class="rm-img" data-idx="${i}" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:#fff;border:none;border-radius:999px;width:20px;height:20px;font-size:11px;">✕</button>
        </div>`).join('');

      const variantsHtml = variants.map((v,vi)=>`
        <div class="zone-block">
          <div class="variant-editor-row">
            <input type="text" placeholder="Nama variasi (cth: Saiz)" value="${escapeHtml(v.name)}" data-vname="${vi}" style="flex:1;">
            <button type="button" class="icon-mini-btn" data-vdel="${vi}">🗑️</button>
          </div>
          <input type="text" placeholder="Pilihan, dipisah koma (cth: S, M, L)" value="${escapeHtml((v.options||[]).join(', '))}" data-voptions="${vi}">
        </div>`).join('');

      const testimonialsHtml = testimonials.map((t,ti)=>`
        <div class="zone-block">
          <div class="variant-editor-row">
            <input type="text" placeholder="Nama pelanggan (cth: Aiman K.)" value="${escapeHtml(t.name||'')}" data-tname="${ti}" style="flex:1;">
            <button type="button" class="icon-mini-btn" data-tdel="${ti}">🗑️</button>
          </div>
          <select data-trating="${ti}" style="margin-bottom:6px;">
            ${[5,4,3,2,1].map(n=>`<option value="${n}" ${((t.rating||5)===n)?'selected':''}>${'⭐'.repeat(n)} (${n})</option>`).join('')}
          </select>
          <textarea placeholder="Komen pelanggan..." data-tcomment="${ti}" rows="2" style="width:100%;">${escapeHtml(t.comment||'')}</textarea>
        </div>`).join('');

      content.innerHTML = `
        <div class="form-group">
          <span class="field-label">Gambar Produk</span>
          <div>${imgThumbs}</div>
          <div class="upload-box" style="margin-top:6px;">
            <div>+ Tambah Gambar</div>
            <input type="file" accept="image/*" id="prodImgInput">
          </div>
        </div>
        <div class="form-group"><span class="field-label">Nama Produk</span><input type="text" id="pName" value="${escapeHtml(p.name||'')}"></div>
        <div class="form-group">
          <span class="field-label">Kategori</span>
          <select id="pCategory">
            ${CATEGORIES.map(c=>`<option value="${escapeHtml(c)}" ${p.category===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <span class="field-label">Keterangan</span>
          <div class="rte-toolbar">
            <button type="button" class="rte-btn" data-cmd="bold" title="Tebal"><b>B</b></button>
            <button type="button" class="rte-btn" data-cmd="italic" title="Condong"><i>I</i></button>
            <button type="button" class="rte-btn" data-cmd="underline" title="Garis bawah"><u>U</u></button>
            <button type="button" class="rte-btn" data-cmd="insertUnorderedList" title="Senarai bullet">•</button>
            <button type="button" class="rte-btn" data-cmd="insertOrderedList" title="Senarai bernombor">1.</button>
            <button type="button" class="rte-btn" data-cmd="outdent" title="Kurang inden (margin kiri)">⇤</button>
            <button type="button" class="rte-btn" data-cmd="indent" title="Tambah inden (margin kiri)">⇥</button>
            <button type="button" class="rte-btn" data-cmd="justifyFull" title="Justify (rata kiri-kanan)">≣</button>
          </div>
          <div class="rte-editor" id="pDesc" contenteditable="true">${p.description||''}</div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><span class="field-label">Harga (RM)</span><input type="number" step="0.01" id="pPrice" value="${p.price!=null?p.price:''}"></div>
          <div class="form-group"><span class="field-label">Berat (kg)</span><input type="number" step="0.01" id="pWeight" value="${p.weight!=null?p.weight:''}"></div>
        </div>
        <div class="form-group"><span class="field-label">Stok Semasa</span><input type="number" step="1" min="0" id="pStock" value="${p.stock!=null?p.stock:0}"></div>
        <div class="section-title" style="margin-top:6px;">Variasi (pilihan)</div>
        ${variantsHtml}
        <button type="button" class="btn outline small" id="addVariantBtn">+ Tambah Jenis Variasi</button>
        <div class="section-title" style="margin-top:16px;">Testimoni Pelanggan (pilihan)</div>
        <div class="hint" style="margin-bottom:8px;">Testimoni ni akan dipaparkan di halaman produk, sebelum keterangan produk — bantu pelanggan yang teragak-agak untuk beli.</div>
        ${testimonialsHtml}
        <button type="button" class="btn outline small" id="addTestimonialBtn">+ Tambah Testimoni</button>
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button class="btn outline" id="cancelProductBtn" style="flex:1;">Batal</button>
          <button class="btn accent" id="saveProductBtn" style="flex:1;">Simpan</button>
        </div>
      `;
      document.getElementById('prodImgInput').addEventListener('change', async (e)=>{
        const file = e.target.files[0];
        if(!file) return;
        const dataUrl = await resizeImage(file, 640);
        images.push(dataUrl);
        draw();
      });
      content.querySelectorAll('.rm-img').forEach(b=>b.addEventListener('click', ()=>{
        images.splice(parseInt(b.getAttribute('data-idx'),10),1); draw();
      }));
      content.querySelectorAll('.rte-btn').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          document.getElementById('pDesc').focus();
          document.execCommand(btn.getAttribute('data-cmd'), false, null);
        });
      });
      document.getElementById('addVariantBtn').addEventListener('click', ()=>{
        variants.push({name:'', options:[]}); draw();
      });
      content.querySelectorAll('[data-vdel]').forEach(b=>b.addEventListener('click', ()=>{
        variants.splice(parseInt(b.getAttribute('data-vdel'),10),1); draw();
      }));
      content.querySelectorAll('[data-vname]').forEach(inp=>inp.addEventListener('input', ()=>{
        variants[parseInt(inp.getAttribute('data-vname'),10)].name = inp.value;
      }));
      content.querySelectorAll('[data-voptions]').forEach(inp=>inp.addEventListener('input', ()=>{
        variants[parseInt(inp.getAttribute('data-voptions'),10)].options = inp.value.split(',').map(s=>s.trim()).filter(Boolean);
      }));
      document.getElementById('addTestimonialBtn').addEventListener('click', ()=>{
        testimonials.push({name:'', comment:'', rating:5}); draw();
      });
      content.querySelectorAll('[data-tdel]').forEach(b=>b.addEventListener('click', ()=>{
        testimonials.splice(parseInt(b.getAttribute('data-tdel'),10),1); draw();
      }));
      content.querySelectorAll('[data-tname]').forEach(inp=>inp.addEventListener('input', ()=>{
        testimonials[parseInt(inp.getAttribute('data-tname'),10)].name = inp.value;
      }));
      content.querySelectorAll('[data-tcomment]').forEach(ta=>ta.addEventListener('input', ()=>{
        testimonials[parseInt(ta.getAttribute('data-tcomment'),10)].comment = ta.value;
      }));
      content.querySelectorAll('[data-trating]').forEach(sel=>sel.addEventListener('change', ()=>{
        testimonials[parseInt(sel.getAttribute('data-trating'),10)].rating = parseInt(sel.value,10);
      }));
      document.getElementById('cancelProductBtn').addEventListener('click', ()=> renderAdminProducts(content));
      document.getElementById('saveProductBtn').addEventListener('click', async ()=>{
        const name = document.getElementById('pName').value.trim();
        const price = parseFloat(document.getElementById('pPrice').value);
        const weight = parseFloat(document.getElementById('pWeight').value);
        const stock = parseInt(document.getElementById('pStock').value, 10);
        if(!name || isNaN(price) || isNaN(weight)){
          toast('Sila lengkapkan nama, harga & berat');
          return;
        }
        if(isNaN(stock) || stock < 0){
          toast('Sila isi stok (nombor bulat, 0 atau lebih)');
          return;
        }
        const saveBtn = document.getElementById('saveProductBtn');
        saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan...';
        const cleanVariants = variants.filter(v=>v.name.trim() && v.options.length);
        const cleanTestimonials = testimonials.filter(t=>t.name.trim() && t.comment.trim());
        const category = document.getElementById('pCategory').value;
        let result;
        if(isNew){
          const newProduct = {id:uid('prod'), name, description:document.getElementById('pDesc').innerHTML.trim(), price, weight, images, variants:cleanVariants, category, stock, testimonials:cleanTestimonials};
          result = await insertProductRow(newProduct);
          if(result.ok){ state.products.push(newProduct); }
        } else {
          const backup = Object.assign({}, p);
          Object.assign(p, {name, description:document.getElementById('pDesc').innerHTML.trim(), price, weight, images, variants:cleanVariants, category, stock, testimonials:cleanTestimonials});
          result = await updateProductRow(p);
          if(!result.ok){ Object.assign(p, backup); }
        }
        if(!result.ok){
          toast('Gagal simpan — semak sambungan Supabase (lihat Console untuk butiran)');
          saveBtn.disabled = false; saveBtn.textContent = 'Simpan';
          return;
        }
        toast('Produk disimpan');
        renderAdminProducts(content);
        renderCategoryBar();
        renderCatalog();
      });
    }
    draw();
  }

  /* --- Admin: Shipping --- */
  function renderAdminShipping(content){
    function drawZone(zoneKey){
      const rows = state.settings.shippingRates[zoneKey];
      return `
        <div class="zone-block" data-zone="${zoneKey}">
          <h4>${ZONE_LABELS[zoneKey]}</h4>
          <div class="rate-rows">
            ${rows.map((r,ri)=>`
              <div class="rate-row" data-ri="${ri}">
                <input type="number" step="0.01" class="rate-min" value="${r.minKg}" placeholder="Min kg">
                <input type="number" step="0.01" class="rate-max" value="${r.maxKg==null?'':r.maxKg}" placeholder="Max kg">
                <input type="number" step="0.01" class="rate-cost" value="${r.rate}" placeholder="RM">
                <button type="button" class="icon-mini-btn rate-del">🗑️</button>
              </div>`).join('')}
          </div>
          <button type="button" class="btn outline small rate-add">+ Tambah Julat</button>
        </div>`;
    }
    content.innerHTML = `
      <div class="hint" style="margin-bottom:10px;">Tetapkan kadar penghantaran ikut julat berat, untuk setiap zon.</div>
      ${drawZone('semenanjung')}
      ${drawZone('sarawak')}
      ${drawZone('sabah')}
      <button class="btn accent" id="saveShippingBtn" style="width:100%;margin-top:6px;">Simpan Kadar Penghantaran</button>
    `;
    content.querySelectorAll('.zone-block').forEach(block=>{
      const zoneKey = block.getAttribute('data-zone');
      block.querySelector('.rate-add').addEventListener('click', ()=>{
        state.settings.shippingRates[zoneKey].push({minKg:0,maxKg:null,rate:0});
        renderAdminShipping(content);
      });
      block.querySelectorAll('.rate-del').forEach(b=>b.addEventListener('click', ()=>{
        const ri = parseInt(b.closest('.rate-row').getAttribute('data-ri'),10);
        state.settings.shippingRates[zoneKey].splice(ri,1);
        renderAdminShipping(content);
      }));
    });
    document.getElementById('saveShippingBtn').addEventListener('click', async ()=>{
      ['semenanjung','sarawak','sabah'].forEach(zoneKey=>{
        const block = content.querySelector(`.zone-block[data-zone="${zoneKey}"]`);
        const newRows = [];
        block.querySelectorAll('.rate-row').forEach(row=>{
          const min = parseFloat(row.querySelector('.rate-min').value);
          const maxVal = row.querySelector('.rate-max').value;
          const max = maxVal==='' ? null : parseFloat(maxVal);
          const rate = parseFloat(row.querySelector('.rate-cost').value);
          if(!isNaN(min) && !isNaN(rate)) newRows.push({minKg:min, maxKg:max, rate});
        });
        state.settings.shippingRates[zoneKey] = newRows;
      });
      const result = await saveSettings();
      if(!result.ok){
        toast('Gagal simpan kadar penghantaran — semak Console (F12)');
        return;
      }
      toast('Kadar penghantaran disimpan');
    });
  }

  /* --- Admin: Orders --- */
  async function renderAdminOrders(content){
    content.innerHTML = '<div class="empty-hint">Memuatkan pesanan...</div>';
    const orders = await fetchAllOrders();
    if(!orders.length){
      content.innerHTML = '<div class="empty-hint">Belum ada pesanan.</div>';
      return;
    }
    orders.forEach(o=>{ state.ordersCache[o.id] = o; });
    content.innerHTML = orders.filter(Boolean).map(o=>{
      const itemsHtml = o.items.map(it=>`<div>${it.qty}× ${escapeHtml(it.name)}${it.variantLabel&&it.variantLabel!=='none'?' ('+escapeHtml(it.variantLabel)+')':''} — ${money(it.price*it.qty)}</div>`).join('');
      return `
      <div class="order-card" data-order-id="${o.id}">
        <div class="oc-top">
          <span class="oc-name">${escapeHtml(o.customer.name)} <button type="button" class="copy-mini-btn" data-copy="${escapeHtml(o.customer.name)}" title="Salin nama">📋</button></span>
          <span class="status-pill status-${o.status}">${statusLabel(o.status)}</span>
        </div>
        <div class="oc-id">${o.id}</div>
        <div class="oc-meta">📅 ${formatOrderDate(o.createdAt)}</div>
        <div class="oc-meta">${escapeHtml(o.customer.phone)} <button type="button" class="copy-mini-btn" data-copy="${escapeHtml(o.customer.phone)}" title="Salin no. telefon">📋</button> · ${ZONE_LABELS[o.customer.zone]} (${o.customer.postcode})</div>
        <div class="oc-meta">Berat: ${o.weight.toFixed(2)}kg · Penghantaran: ${money(o.shippingCost)} · Jumlah: <strong>${money(o.total)}</strong></div>
        <details>
          <summary>Butiran pesanan & resit</summary>
          <div class="oc-items">${itemsHtml}</div>
          <div class="hint" style="display:flex;align-items:flex-start;gap:6px;">
            <span style="flex:1;">${escapeHtml(o.customer.address)}, ${escapeHtml(o.customer.postcode)}</span>
            <button type="button" class="copy-mini-btn" data-copy="${escapeHtml(o.customer.address)}, ${escapeHtml(o.customer.postcode)}" title="Salin alamat">📋</button>
          </div>
          <button type="button" class="btn small outline copy-all-btn" style="width:100%;margin-top:8px;"
            data-name="${escapeHtml(o.customer.name)}" data-phone="${escapeHtml(o.customer.phone)}" data-address="${escapeHtml(o.customer.address)}, ${escapeHtml(o.customer.postcode)}">
            📋 Salin Semua (Nama, Telefon, Alamat)
          </button>
          <div class="oc-receipt">${o.receiptImage?(o.receiptImage.startsWith('data:application/pdf')?`<a href="${o.receiptImage}" target="_blank" rel="noopener" class="btn small outline" style="display:inline-block;text-decoration:none;">📄 Lihat Resit (PDF)</a>`:`<img src="${o.receiptImage}">`):'<span class="hint">Tiada resit</span>'}</div>
          <div class="form-group" style="margin-top:10px;">
            <span class="field-label">No. Tracking (Pos Laju)</span>
            <div style="display:flex;gap:8px;">
              <input type="text" class="tracking-input" data-order-id="${o.id}" value="${escapeHtml(o.trackingNumber||'')}" placeholder="Cth: EA123456789MY" style="flex:1;">
              <button type="button" class="btn small tracking-save-btn" data-order-id="${o.id}">Simpan</button>
            </div>
          </div>
          <div class="form-group" style="margin-top:10px;">
            <span class="field-label">Tukar Status</span>
            <select class="status-select" data-order-id="${o.id}">
              <option value="awaiting_payment" ${o.status==='awaiting_payment'?'selected':''}>Menunggu Bayaran (Online)</option>
              <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
              <option value="paid" ${o.status==='paid'?'selected':''}>Paid</option>

              <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
              <option value="completed" ${o.status==='completed'?'selected':''}>Completed</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
            <button type="button" class="btn accent small waybill-btn" data-order-id="${o.id}">📦 Jana Waybill</button>
            ${o.customer.email?`<button type="button" class="btn outline small email-customer-btn" data-order-id="${o.id}">📧 Emel Pelanggan</button>`:''}
            <button type="button" class="btn outline small whatsapp-customer-btn" data-order-id="${o.id}">📱 WhatsApp Pelanggan</button>
            <button type="button" class="btn small delete-order-btn" data-order-id="${o.id}" style="background:var(--danger);color:#fff;margin-left:auto;">🗑️ Padam</button>
          </div>
          <div id="waybillForm-${o.id}"></div>
        </details>
      </div>`;
    }).join('');
    content.querySelectorAll('.copy-mini-btn').forEach(b=>b.addEventListener('click', async (e)=>{
      e.preventDefault();
      const text = b.getAttribute('data-copy');
      try{ await navigator.clipboard.writeText(text); toast('Disalin ✓'); }
      catch(err){ toast('Tidak dapat menyalin — sila salin manual'); }
    }));
    content.querySelectorAll('.copy-all-btn').forEach(b=>b.addEventListener('click', async (e)=>{
      e.preventDefault();
      const text = `${b.getAttribute('data-name')}\n${b.getAttribute('data-phone')}\n${b.getAttribute('data-address')}`;
      try{ await navigator.clipboard.writeText(text); toast('Maklumat penghantaran disalin ✓'); }
      catch(err){ toast('Tidak dapat menyalin — sila salin manual'); }
    }));
    content.querySelectorAll('.tracking-save-btn').forEach(b=>b.addEventListener('click', async ()=>{
      const id = b.getAttribute('data-order-id');
      const order = orders.find(x=>x && x.id===id);
      if(!order) return;
      const input = content.querySelector(`.tracking-input[data-order-id="${id}"]`);
      const newTracking = input.value.trim();
      const isNewTracking = newTracking && newTracking !== order.trackingNumber;
      order.trackingNumber = newTracking;
      state.ordersCache[id] = order;
      const saveResult = await saveOrder(order);
      if(!saveResult.ok){
        toast('Gagal simpan no. tracking — semak Console (F12)');
        return;
      }
      toast('No. tracking disimpan');
      if(isNewTracking && order.customer.email){
        openMailto(order.customer.email, `No. Tracking Pesanan Anda - ${order.id}`,
          `Hai ${order.customer.name},\n\nPesanan anda telah dihantar.\nNo. Tracking Pos Laju: ${newTracking}\n\nAnda boleh jejak pesanan dalam app ini (tab Jejak Pesanan) atau di laman rasmi Pos Laju.\n\nTerima kasih.`);
      }
      renderAdminOrders(content);
    }));
    content.querySelectorAll('.email-customer-btn').forEach(b=>b.addEventListener('click', ()=>{
      const o = orders.find(x=>x && x.id===b.getAttribute('data-order-id'));
      if(!o || !o.customer.email) return;
      openMailto(o.customer.email, `Kemaskini Pesanan Anda - ${o.id}`, orderEmailBody(o));
    }));
    content.querySelectorAll('.whatsapp-customer-btn').forEach(b=>b.addEventListener('click', ()=>{
      const o = orders.find(x=>x && x.id===b.getAttribute('data-order-id'));
      if(!o) return;
      const phone = o.customer.phoneDigits || o.customer.phone;
      openWhatsApp(phone, orderWhatsAppMessage(o));
    }));
    content.querySelectorAll('.delete-order-btn').forEach(b=>b.addEventListener('click', async ()=>{
      const id = b.getAttribute('data-order-id');
      const o = orders.find(x=>x && x.id===id);
      if(!confirm(`Padam pesanan ${id}${o?' ('+o.customer.name+')':''} secara kekal? Tindakan ini tidak boleh dibatalkan.`)) return;
      const result = await deleteOrderRow(id);
      if(!result.ok){
        toast('Gagal padam pesanan — semak Console (F12)');
        return;
      }
      delete state.ordersCache[id];
      toast('Pesanan dipadam');
      renderAdminOrders(content);
    }));
    content.querySelectorAll('.waybill-btn').forEach(b=>b.addEventListener('click', ()=>{
      const id = b.getAttribute('data-order-id');
      const o = orders.find(x=>x && x.id===id);
      if(o) renderWaybillForm(id, o);
    }));
    content.querySelectorAll('.status-select').forEach(sel=>{
      sel.addEventListener('change', async ()=>{
        const id = sel.getAttribute('data-order-id');
        const order = orders.find(x=>x && x.id===id);
        if(!order) return;
        const newStatus = sel.value;

        // Elak ketidakselarasan: status "Shipped" mesti ada No. Tracking dulu
        if(newStatus==='shipped' && !order.trackingNumber){
          const trackingInput = content.querySelector(`.tracking-input[data-order-id="${id}"]`);
          const typedTracking = trackingInput ? trackingInput.value.trim() : '';
          if(!typedTracking){
            toast('Sila isi & simpan No. Tracking dahulu sebelum tukar status ke "Shipped"');
            sel.value = order.status; // kembalikan dropdown ke status asal
            return;
          }
          // Admin dah taip No. Tracking tapi belum tekan Simpan berasingan — simpan sekali
          order.trackingNumber = typedTracking;
        }

        const justPaid = newStatus === 'paid' && order.status !== 'paid';
        const justCompleted = newStatus === 'completed' && order.status !== 'completed';
        order.status = newStatus;
        if(justCompleted) order.completedAt = new Date().toISOString();
        if(justPaid){
          sendTelegramNotification(`✅ <b>Bayaran Disahkan</b>\n\nNo. Pesanan: ${order.id}\nNama: ${escapeHtml(order.customer.name)}\nJumlah: ${money(order.total)}`);
        }
        state.ordersCache[id] = order;
        const saveResult = await saveOrder(order);
        if(!saveResult.ok){
          toast('Gagal kemas kini status — semak Console (F12)');
          return;
        }
        toast('Status dikemaskini');
        renderAdminOrders(content);
      });
    });
  }
  function renderWaybillForm(orderId, order){
    const box = document.getElementById('waybillForm-'+orderId);
    if(!box) return;
    if(box.dataset.open === 'true'){ box.innerHTML=''; box.dataset.open='false'; return; }
    box.dataset.open = 'true';
    const guessedState = guessStateFromPostcode(order.customer.postcode);
    const alreadyHasWaybill = !!order.waybillPdfUrl;
    box.innerHTML = `
      <div class="zone-block" style="margin-top:10px;">
        <h4>Jana Waybill Pos Laju</h4>
        ${alreadyHasWaybill ? `<div class="hint" style="margin-bottom:8px;">✅ Waybill sedia ada: <a href="${order.waybillPdfUrl}" target="_blank" rel="noopener">Buka PDF</a></div>` : ''}
        <div class="hint" style="margin-bottom:10px;">Sahkan/lengkapkan maklumat di bawah (Bandar/Negeri penerima ditekakan dari poskod — sila semak betul).</div>
        <span class="field-label">Bandar Penerima</span>
        <input type="text" id="wbCity-${orderId}" value="${escapeHtml(order.customer.city||'')}" placeholder="Cth: Kangar" style="margin-bottom:8px;">
        <span class="field-label">Negeri Penerima</span>
        <input type="text" id="wbState-${orderId}" value="${escapeHtml(guessedState)}" placeholder="Cth: Perlis" style="margin-bottom:8px;">
        <span class="field-label">Berat (kg)</span>
        <input type="number" step="0.01" id="wbWeight-${orderId}" value="${order.weight}" style="margin-bottom:12px;">
        <button type="button" class="btn accent small" id="wbSubmit-${orderId}" style="width:100%;">${alreadyHasWaybill ? '🔁 Jana Semula Waybill (No. Tracking Baharu)' : '🚀 Hantar ke Pos Laju & Jana Waybill'}</button>
        <div id="wbResult-${orderId}" style="margin-top:10px;"></div>
      </div>
    `;
    document.getElementById('wbSubmit-'+orderId).addEventListener('click', async ()=>{
      // Waybill dah pernah dijana untuk pesanan ni — amaran dulu sebelum jana
      // SEMULA, sebab ini akan cipta consignment BAHARU kat Pos Laju dengan
      // No. Tracking BAHARU (bukan cetak semula waybill lama). Tekan dua kali
      // tanpa sengaja sebelum ni sebabkan No. Tracking bertukar-tukar.
      if(alreadyHasWaybill){
        const confirmed = window.confirm(
          `Waybill untuk pesanan ni DAH PERNAH dijana (No. Tracking: ${order.trackingNumber || '—'}).\n\n` +
          `Jana semula akan CIPTA CONSIGNMENT BAHARU di Pos Laju dengan No. Tracking BAHARU — bukan cetak semula waybill yang sama.\n\n` +
          `Teruskan jana waybill baharu?`
        );
        if(!confirmed) return;
      }
      const city = document.getElementById('wbCity-'+orderId).value.trim();
      const stateVal = document.getElementById('wbState-'+orderId).value.trim();
      const weight = parseFloat(document.getElementById('wbWeight-'+orderId).value);
      const resultBox = document.getElementById('wbResult-'+orderId);
      if(!city || !stateVal || !weight){
        toast('Sila lengkapkan Bandar, Negeri & Berat');
        return;
      }
      if(!state.settings.senderName || !state.settings.senderAddress1 || !state.settings.senderPostcode){
        toast('Sila lengkapkan Maklumat Kedai (Sender) dulu di Tetapan');
        return;
      }
      const submitBtn = document.getElementById('wbSubmit-'+orderId);
      submitBtn.disabled = true; submitBtn.textContent = 'Menghantar ke Pos Laju...';
      resultBox.innerHTML = '';
      try{
        const res = await fetch(window.WAYBILL_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            'Authorization': 'Bearer ' + window.SUPABASE_ANON_KEY,
            'apikey': window.SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            orderId: order.id,
            sender: {
              name: state.settings.senderName,
              phone_number: state.settings.senderPhone,
              email: state.settings.senderEmail,
              address1: state.settings.senderAddress1,
              city: state.settings.senderCity,
              state: state.settings.senderState,
              postcode: state.settings.senderPostcode
            },
            receiver: {
              name: order.customer.name,
              phone_number: order.customer.phone.startsWith('+')?order.customer.phone:('+6'+order.customer.phone.replace(/^0/,'')),
              address1: order.customer.address,
              city: city,
              state: stateVal,
              postcode: order.customer.postcode
            },
            weight: weight,
            items: order.items.map(it=>({name:it.name, quantity:it.qty, value:it.price}))
          })
        });
        const data = await res.json();
        submitBtn.disabled = false; submitBtn.textContent = '🚀 Hantar ke Pos Laju & Jana Waybill';
        if(!data.ok){
          resultBox.innerHTML = `<div class="hint" style="color:var(--danger);">Gagal: ${escapeHtml(JSON.stringify(data.error))}</div>`;
          return;
        }
        order.trackingNumber = data.tracking_no;
        order.waybillPdfUrl = data.label_pdf_url;
        state.ordersCache[orderId] = order;
        await saveOrder(order);
        resultBox.innerHTML = `<div class="hint" style="color:var(--success);">✅ Berjaya! No. Tracking: <strong>${escapeHtml(data.tracking_no)}</strong></div><a href="${data.label_pdf_url}" target="_blank" rel="noopener" class="btn small accent" style="display:inline-block;margin-top:8px;text-decoration:none;">📄 Buka & Print Waybill (A6)</a>`;
        toast('Waybill berjaya dijana!');
      }catch(err){
        submitBtn.disabled = false; submitBtn.textContent = '🚀 Hantar ke Pos Laju & Jana Waybill';
        resultBox.innerHTML = `<div class="hint" style="color:var(--danger);">Ralat: ${escapeHtml(String(err))}</div>`;
      }
    });
  }
  function statusLabel(s){
    return {awaiting_payment:'Menunggu Bayaran (Online)', pending:'Pending', paid:'Paid', shipped:'Shipped', completed:'Completed'}[s] || s;
  }

  /* --- Admin: Settings --- */
  function renderAdminSettings(content){
    content.innerHTML = `
      <div class="form-group"><span class="field-label">Nama Kedai</span><input type="text" id="storeNameInput" value="${escapeHtml(state.settings.storeName)}"></div>
      <div class="form-group">
        <span class="field-label">Logo Kedai</span>
        <div class="upload-box">
          <div>${state.settings.storeLogo?'Ketik untuk tukar logo':'+ Upload logo kedai'}</div>
          ${state.settings.storeLogo?`<img src="${state.settings.storeLogo}" class="upload-preview">`:''}
          <input type="file" accept="image/*" id="logoInput">
        </div>
      </div>
      <div class="form-group">
        <span class="field-label">Gambar QR Bank</span>
        <div class="upload-box">
          <div>${state.settings.qrImage?'Ketik untuk tukar QR':'+ Upload gambar QR'}</div>
          ${state.settings.qrImage?`<img src="${state.settings.qrImage}" class="upload-preview">`:''}
          <input type="file" accept="image/*" id="qrInput">
        </div>
      </div>
      <div class="form-group"><span class="field-label">Tukar PIN Login</span><input type="text" id="pinInput" value="${escapeHtml(state.settings.adminPin)}" maxlength="8"></div>

      <div class="section-title">Maklumat Kedai (Sender Waybill)</div>
      <div class="hint" style="margin-bottom:8px;">Maklumat ni digunakan sebagai "penghantar" bila jana waybill Pos Laju.</div>
      <div class="form-group"><span class="field-label">Nama Kedai/Syarikat</span><input type="text" id="senderNameInput" value="${escapeHtml(state.settings.senderName||'')}" placeholder="CKT Global"></div>
      <div class="form-group"><span class="field-label">No. Telefon (format +60...)</span><input type="text" id="senderPhoneInput" value="${escapeHtml(state.settings.senderPhone||'')}" placeholder="+60123456789"></div>
      <div class="form-group"><span class="field-label">Email</span><input type="text" id="senderEmailInput" value="${escapeHtml(state.settings.senderEmail||'')}" placeholder="ckt1malaysia@gmail.com"></div>
      <div class="form-group"><span class="field-label">Alamat</span><input type="text" id="senderAddress1Input" value="${escapeHtml(state.settings.senderAddress1||'')}" placeholder="No 1, Jalan..."></div>
      <div class="form-row-2">
        <div class="form-group"><span class="field-label">Bandar</span><input type="text" id="senderCityInput" value="${escapeHtml(state.settings.senderCity||'')}"></div>
        <div class="form-group"><span class="field-label">Negeri</span><input type="text" id="senderStateInput" value="${escapeHtml(state.settings.senderState||'')}"></div>
      </div>
      <div class="form-group"><span class="field-label">Poskod</span><input type="text" id="senderPostcodeInput" value="${escapeHtml(state.settings.senderPostcode||'')}" maxlength="5"></div>

      <div class="section-title">Notifikasi Telegram</div>
      <div class="hint" style="margin-bottom:8px;">Terima notifikasi automatik (pesanan baru, bayaran disahkan) terus di Telegram. Boleh tukar destinasi (Bot Token/Chat ID) bila-bila masa — lihat panduan cara dapatkan nilai ni.</div>
      <div class="form-group"><span class="field-label">Bot Token</span><input type="text" id="telegramTokenInput" value="${escapeHtml(state.settings.telegramBotToken||'')}" placeholder="Cth: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"></div>
      <div class="form-group"><span class="field-label">Chat ID</span><input type="text" id="telegramChatIdInput" value="${escapeHtml(state.settings.telegramChatId||'')}" placeholder="Cth: 987654321"></div>
      <button type="button" class="btn small outline" id="testTelegramBtn" style="width:100%;margin-bottom:16px;">📨 Hantar Mesej Test</button>

      <div class="section-title">Banner Promosi (Video / Imej)</div>
      <div class="hint" style="margin-bottom:8px;">Dipaparkan di atas, antara bar kategori dan senarai produk.</div>
      <div class="form-group">
        <span class="field-label">Cara Tambah Banner</span>
        <select id="promoVideoTypeSelect">
          <option value="none" ${state.settings.promoVideoType==='none'?'selected':''}>Tiada banner</option>
          <option value="upload" ${state.settings.promoVideoType==='upload'?'selected':''}>Upload fail video (klip pendek)</option>
          <option value="url" ${state.settings.promoVideoType==='url'?'selected':''}>Guna URL (YouTube / link video terus)</option>
          <option value="image" ${state.settings.promoVideoType==='image'?'selected':''}>Upload imej banner (JPEG/PNG, 1200×300px)</option>
        </select>
      </div>
      <div id="promoVideoFields"></div>
      <button class="btn accent" id="saveSettingsBtn" style="width:100%;margin-top:16px;">Simpan Tetapan</button>
    `;
    function drawPromoVideoFields(){
      const type = document.getElementById('promoVideoTypeSelect').value;
      const box = document.getElementById('promoVideoFields');
      if(type==='upload'){
        box.innerHTML = `
          <div class="upload-box">
            <div>${state.settings.promoVideo?'Ketik untuk tukar video':'+ Upload fail video'}</div>
            ${state.settings.promoVideo?`<video src="${state.settings.promoVideo}" class="upload-preview" controls muted></video>`:''}
            <input type="file" accept="video/*" id="promoVideoInput">
          </div>
          <div class="hint">⚠️ Elakkan fail besar — disyorkan klip pendek (5-15 saat) dan saiz di bawah 5MB, supaya kedai anda kekal pantas dimuatkan.</div>
        `;
        document.getElementById('promoVideoInput').addEventListener('change', (e)=>{
          const file = e.target.files[0];
          if(!file) return;
          const sizeMB = file.size/1024/1024;
          if(sizeMB > 15){
            toast('Fail terlalu besar (>15MB) — sila guna klip lebih pendek atau mampatkan dulu');
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev)=>{
            state.settings.promoVideo = ev.target.result;
            drawPromoVideoFields();
            toast(`Video dipilih (${sizeMB.toFixed(1)}MB) — tekan Simpan Tetapan untuk sahkan`);
          };
          reader.readAsDataURL(file);
        });
      } else if(type==='url'){
        box.innerHTML = `
          <div class="form-group">
            <span class="field-label">URL Video</span>
            <input type="text" id="promoVideoUrlInput" value="${escapeHtml(state.settings.promoVideoUrl||'')}" placeholder="https://youtube.com/watch?v=... atau link .mp4">
          </div>
          <div class="hint">Boleh guna link YouTube biasa, atau link terus ke fail video (.mp4) yang dihoskan di tempat lain.</div>
        `;
      } else if(type==='image'){
        const imgs = state.settings.promoImages || [];
        const thumbsHtml = imgs.map((im,i)=>`
          <div style="position:relative;display:inline-block;margin:0 6px 6px 0;">
            <img src="${im}" style="width:90px;height:35px;object-fit:cover;border-radius:6px;">
            <button type="button" class="rm-promo-img" data-idx="${i}" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:#fff;border:none;border-radius:999px;width:20px;height:20px;font-size:11px;">✕</button>
          </div>`).join('');
        box.innerHTML = `
          <div class="hint" style="margin-bottom:8px;">Disyorkan 3-5 imej — bertukar automatik setiap 3 saat. Terlalu banyak imej buat promo penting "tenggelam" dan kedai jadi lambat dimuatkan (imej disimpan terus, bukan link luar).</div>
          <div>${thumbsHtml}</div>
          <div class="upload-box" style="margin-top:6px;">
            <div>+ Tambah Imej Banner (${imgs.length}/5 disyorkan)</div>
            <input type="file" accept="image/jpeg,image/png" id="promoImageInput">
          </div>
        `;
        document.getElementById('promoImageInput').addEventListener('change', (e)=>{
          const file = e.target.files[0];
          if(!file) return;
          if((state.settings.promoImages||[]).length >= 8){
            toast('Dah 8 imej — elok padam mana-mana dulu sebelum tambah lagi (lebih dari tu terlalu berat untuk kedai)');
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev)=>{
            const img = new Image();
            img.onload = ()=>{
              const targetW = 1200, targetH = 300;
              const canvas = document.createElement('canvas');
              canvas.width = targetW; canvas.height = targetH;
              const ctx = canvas.getContext('2d');
              const srcRatio = img.width / img.height;
              const targetRatio = targetW / targetH;
              let sx, sy, sw, sh;
              if(srcRatio > targetRatio){
                sh = img.height; sw = sh * targetRatio;
                sx = (img.width - sw) / 2; sy = 0;
              } else {
                sw = img.width; sh = sw / targetRatio;
                sx = 0; sy = (img.height - sh) / 2;
              }
              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
              if(!state.settings.promoImages) state.settings.promoImages = [];
              state.settings.promoImages.push(canvas.toDataURL('image/jpeg', 0.82));
              drawPromoVideoFields();
              toast('Imej ditambah & dikecilkan ke 1200×300px — tekan Simpan Tetapan untuk sahkan');
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
        box.querySelectorAll('.rm-promo-img').forEach(b=>b.addEventListener('click', ()=>{
          state.settings.promoImages.splice(parseInt(b.getAttribute('data-idx'),10),1);
          drawPromoVideoFields();
        }));
      } else {
        box.innerHTML = '';
      }
    }
    drawPromoVideoFields();
    document.getElementById('promoVideoTypeSelect').addEventListener('change', drawPromoVideoFields);
    document.getElementById('logoInput').addEventListener('change', async (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      state.settings.storeLogo = await resizeImage(file, 300);
      renderAdminSettings(content);
    });
    document.getElementById('qrInput').addEventListener('change', async (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      state.settings.qrImage = await resizeImage(file, 600);
      renderAdminSettings(content);
    });
    document.getElementById('testTelegramBtn').addEventListener('click', async ()=>{
      const token = document.getElementById('telegramTokenInput').value.trim();
      const chatId = document.getElementById('telegramChatIdInput').value.trim();
      if(!token || !chatId){ toast('Sila isi Bot Token & Chat ID dahulu'); return; }
      const oldToken = state.settings.telegramBotToken, oldChatId = state.settings.telegramChatId;
      state.settings.telegramBotToken = token;
      state.settings.telegramChatId = chatId;
      const testBtn = document.getElementById('testTelegramBtn');
      testBtn.disabled = true; testBtn.textContent = 'Menghantar...';
      const result = await sendTelegramNotification('🔔 Ini mesej test dari CKT Global Webstore. Jika anda terima ini, sambungan Telegram berfungsi!');
      testBtn.disabled = false; testBtn.textContent = '📨 Hantar Mesej Test';
      state.settings.telegramBotToken = oldToken;
      state.settings.telegramChatId = oldChatId;
      if(result.ok){ toast('Mesej test berjaya dihantar! Semak Telegram anda'); }
      else{ toast('Gagal hantar — semak Bot Token/Chat ID (' + (result.error||'ralat tidak diketahui') + ')'); }
    });
    document.getElementById('saveSettingsBtn').addEventListener('click', async ()=>{
      const backup = Object.assign({}, state.settings);
      state.settings.storeName = document.getElementById('storeNameInput').value.trim() || 'Kedai Saya';
      state.settings.adminPin = document.getElementById('pinInput').value.trim() || '1234';
      state.settings.telegramBotToken = document.getElementById('telegramTokenInput').value.trim();
      state.settings.telegramChatId = document.getElementById('telegramChatIdInput').value.trim();
      state.settings.senderName = document.getElementById('senderNameInput').value.trim();
      state.settings.senderPhone = document.getElementById('senderPhoneInput').value.trim();
      state.settings.senderEmail = document.getElementById('senderEmailInput').value.trim();
      state.settings.senderAddress1 = document.getElementById('senderAddress1Input').value.trim();
      state.settings.senderCity = document.getElementById('senderCityInput').value.trim();
      state.settings.senderState = document.getElementById('senderStateInput').value.trim();
      state.settings.senderPostcode = document.getElementById('senderPostcodeInput').value.trim();
      const videoType = document.getElementById('promoVideoTypeSelect').value;
      state.settings.promoVideoType = videoType;
      if(videoType==='url'){
        state.settings.promoVideoUrl = document.getElementById('promoVideoUrlInput').value.trim();
      }
      if(videoType==='none'){
        state.settings.promoVideo = null;
        state.settings.promoVideoUrl = '';
        state.settings.promoImage = null;
      }
      const saveBtn = document.getElementById('saveSettingsBtn');
      saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan...';
      const result = await saveSettings();
      saveBtn.disabled = false; saveBtn.textContent = 'Simpan Tetapan';
      if(!result.ok){
        state.settings = backup;
        toast('Gagal simpan — semak Console (F12) untuk mesej error penuh');
        return;
      }
      renderCatalog();
      renderPromoVideo();
      toast('Tetapan disimpan');
    });
  }

  /* ================= INIT ================= */
  async function init(){
    // Kalau license-check.js dimuatkan (untuk kedai klien berlesen),
    // tunggu keputusan semakan lesen dulu sebelum teruskan.
    if(window.__LICENSE_CHECK_PROMISE__){
      await window.__LICENSE_CHECK_PROMISE__;
      if(window.__LICENSE_OK__ === false){
        return; // license-check.js sudah papar skrin terkunci — hentikan init app terus
      }
    }
    const cachedBranding = loadBrandingCache();
    if(cachedBranding) applyBrandingToHeader(cachedBranding.storeName, cachedBranding.storeLogo);
    await loadAll();
    saveBrandingCache(state.settings.storeName, state.settings.storeLogo);
    renderCategoryBar();
    renderPromoVideo();
    renderCatalog();
    updateCartBadge();
    if(!supabaseConfigOk){
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:200;background:#C1443C;color:#fff;padding:10px 14px;font-size:12.5px;text-align:center;';
      banner.textContent = '⚠️ Supabase belum disambungkan — sila isi SUPABASE_URL & SUPABASE_ANON_KEY di bahagian atas fail HTML ini.';
      document.body.prepend(banner);
    }
  }
  init();

})();
