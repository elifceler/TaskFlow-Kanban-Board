# TaskFlow Kanban Board

TaskFlow, küçük yazılım ekipleri için hazırlanmış Trello benzeri bir Kanban proje yönetim uygulamasıdır. Kullanıcılar hesap oluşturabilir, giriş yapabilir, board/sütun/kart yönetebilir, kart detaylarını düzenleyebilir ve kartları sürükle-bırak ile farklı durumlar arasında taşıyabilir.

Canlı demo: https://taskflow-kanban-case-2026.vercel.app

Demo hesap:

```txt
E-posta: demo@taskflow.local
Şifre: taskflow
```

## Özellikler

- Kullanıcı kayıt ve giriş akışı
- Birden fazla board oluşturma
- Sütun ekleme, yeniden adlandırma, silme ve sürükle-bırak ile sütun sıralama
- Kart ekleme, silme ve kart detaylarını düzenleme
- Kart başlığı, açıklama, etiket, sorumlu kişi ve tarih alanları
- Kartları aynı sütun içinde veya farklı sütunlar arasında sürükle-bırak ile taşıma
- Mobilde yatay board görünümü ve ok butonlarıyla alternatif kart taşıma
- Kart taşıma aktivite geçmişi
- Sayfa yenilendiğinde board, sütun, kart ve sıralama verisini koruma
- Vercel üzerinde çalışan production deploy

## Teknoloji Seçimleri

- Next.js App Router: Vercel ile doğrudan uyumlu, modern React uygulama yapısı sunduğu için tercih edildi.
- React 19: Component tabanlı interaktif Kanban arayüzü için kullanıldı.
- TypeScript: Board, sütun ve kart veri modelini daha güvenli tutmak için kullanıldı.
- Tailwind CSS: Hızlı ve tutarlı responsive arayüz geliştirmek için kullanıldı.
- dnd-kit: Modern, bakımı devam eden ve React ile iyi çalışan sürükle-bırak kütüphanesi olduğu için seçildi.
- localStorage: Board verisini tarayıcı tarafında kalıcı tutmak için kullanıldı. Veri modeli normalize tutulduğu için aynı yapı daha sonra API + veritabanı katmanına taşınabilir.

## Sürükle-Bırak Kütüphanesi Kararı

Bu proje için `dnd-kit` seçildi.

Kısa karşılaştırma:

- `dnd-kit`: Modern, aktif geliştiriliyor, pointer/touch/keyboard sensor desteği güçlü, React state modeliyle uyumlu.
- `@hello-pangea/dnd`: Kullanımı kolay ve `react-beautiful-dnd` mirasını sürdürüyor; ancak yeni projelerde `dnd-kit` kadar esnek değil.
- `SortableJS`: Hafif ve pratik; fakat React ile kullanıldığında state senkronizasyonu için daha fazla adaptasyon kodu gerektirebilir.
- Tarayıcı yerleşik drag-and-drop: Ek kütüphane gerektirmez; ancak mobil/touch deneyimi ve özel görsel ipuçları daha sınırlıdır.

Case dokümanında temel sürükle-bırak deneyimi, görsel ipuçları ve mobil kullanılabilirlik özellikle vurgulandığı için `dnd-kit` daha uygun seçenek olarak değerlendirildi.

## Veri Modeli ve Sıralama Mantığı

Veri modeli board -> sütun -> kart ilişkisini net tutacak şekilde ayrıldı.

```ts
Board {
  columnOrder: string[];
  columns: Record<string, Column>;
  cards: Record<string, CardItem>;
}

Column {
  cardIds: string[];
}
```

Sütun sırası `board.columnOrder` dizisinde tutulur. Kartların sırası ise ilgili sütunun `cardIds` dizisinde tutulur. Kartın detay verisi `board.cards` içinde id ile saklanır.

Bu yaklaşımın avantajları:

- Kart detayları tek yerde tutulur.
- Sütunlar sadece kart id sıralamasını bilir.
- Kart aynı sütunda yeniden sıralandığında sadece ilgili sütunun `cardIds` dizisi değişir.
- Kart başka sütuna taşındığında eski sütunun `cardIds` listesinden çıkarılır, yeni sütunun `cardIds` listesine eklenir.
- Sayfa yenilendiğinde aynı model `localStorage` içinden geri yüklenir.

Bu sürümde sıralama dizileri yeniden hesaplanarak saklanır. Model, ileride veritabanı kullanılacaksa kartlara `position` alanı eklenerek veya fractional ordering yaklaşımıyla genişletilebilir.

## Mobil Kullanılabilirlik

Mobilde Kanban board yatay kaydırılabilir olarak tasarlandı. `dnd-kit` touch sensor ile dokunmatik cihazlarda sürükle-bırak etkileşimini destekler. Bunun yanında, mobilde sürükle-bırak her zaman rahat olmadığı için kartlara alternatif taşıma butonları eklendi:

- sola/sağa taşıma
- yukarı/aşağı sıralama

Bu sayede dokunmatik cihazlarda sürükle-bırak kullanmadan da görev durumu güncellenebilir.

## Önceliklendirme

Case dokümanında temel sürükle-bırak deneyimine ve sıralama kalıcılığına özellikle dikkat edileceği belirtildiği için öncelik bu alanlara verildi:

1. Board, sütun ve kart veri modeli
2. Sorunsuz kart sürükle-bırak akışı
3. Sıralamanın sayfa yenilemesinde korunması
4. Kart detaylarını düzenleme
5. Mobilde kullanılabilir alternatif kontroller
6. Vercel deploy

Etiket, sorumlu kişi, tarih ve aktivite geçmişi eklendi; ancak proje ana amacını bozacak kadar genişletilmedi.

## Sonraki İterasyonlar

Mevcut sürüm, verilen case'deki Kanban deneyimi ve sıralama kalıcılığı üzerine odaklanır. Production'a daha yakın bir sürüme ilerlerken aşağıdaki geliştirmeler eklenebilir:

- Çok cihazlı veri senkronizasyonu için backend API ve veritabanı
- Production seviyesinde auth provider entegrasyonu
- Board paylaşma ve çok kullanıcılı eş zamanlı düzenleme
- Bildirim sistemi
- Detaylı rol/izin yapısı

Bu maddeler, mevcut normalize veri modelinin üzerine eklenebilecek bir sonraki adımlar olarak konumlandırıldı.

## Kod Mimarisi

Kod, tek dosyada toplanmak yerine domain ve UI sorumluluklarına ayrıldı.

```txt
src/app/page.tsx
src/components/taskflow/TaskFlowApp.tsx
src/components/taskflow/AuthScreen.tsx
src/components/taskflow/BoardSidebar.tsx
src/components/taskflow/KanbanColumn.tsx
src/components/taskflow/TaskCard.tsx
src/components/taskflow/CardDialog.tsx
src/lib/taskflow.ts
src/types/taskflow.ts
```

- `types/taskflow.ts`: Board, Column, Card ve AppState tipleri
- `lib/taskflow.ts`: Seed data, localStorage okuma, sıralama/helper fonksiyonları
- `components/taskflow`: UI componentleri
- `app/page.tsx`: Uygulama giriş noktası

## Kurulum

```bash
npm install
npm run dev
```

Lokal adres:

```txt
http://localhost:3000
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Doğrulama

Projede şu kontroller yapıldı:

- `npm run lint` başarılı
- `npm run build` başarılı
- Vercel production deploy başarılı
- Canlı URL HTTP 200 dönüyor
- Kart taşıma sonrası sayfa yenilemede sıralamanın korunduğu doğrulandı

## Notlar

Bu projede backend katmanı bilinçli olarak eklenmemiştir.

Case dokümanında özellikle sürükle-bırak deneyimi, sıralama mantığı ve veri modeline odaklanılacağı belirtildiği için öncelik bu alanlara verilmiştir.

Veri saklama için localStorage kullanılarak sayfa yenilemelerinde state korunmuştur.

Mevcut veri modeli normalize tutulduğu için aynı yapı kolayca backend (API + veritabanı) ile genişletilebilir. bunu koddan mı gördün
