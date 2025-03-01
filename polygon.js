// Глобальная переменная для хранения загруженного изображения (Data URL)
let imageDataURL = null;

// Функция для обработки загрузки изображения
function handleImageUpload(input) {
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            imageDataURL = e.target.result; // Сохраняем Data URL
            console.log("Изображение загружено и преобразовано в Data URL");
        }

        reader.readAsDataURL(file); // Преобразуем файл в Data URL
    } else {
        imageDataURL = null; // Если файл не выбран, сбрасываем
    }
}

// Функция для сохранения SCP-объекта (в LocalStorage)
function saveSCP() {
  const title = document.getElementById('title').value;
  const objectClass = document.getElementById('objectClass').value; // Получаем класс объекта
  const scpNumber = document.getElementById('scpNumber').value; // Получаем номер SCP
  const content = document.getElementById('content').value;

  // Форматирование объекта
  const formattedContent = `
<h2>Объект</h2>
<p>SCP-${scpNumber}</p> <!-- Номер SCP вводит пользователь -->
<h2>Класс объекта</h2>
<p><a href="object-classes">${objectClass}</a></p>
${imageDataURL ? `<img src="${imageDataURL}" class="image" alt="${title}">` : ''}
<h2>${title}</h2>
${content}
  `;

  // Сохранение в LocalStorage
  const scpObject = {
    title: title,
    content: formattedContent,
    image: imageDataURL,
    objectClass: objectClass,
    scpNumber: scpNumber // Сохраняем номер SCP
  };
  localStorage.setItem(title, JSON.stringify(scpObject));

  alert('SCP-объект сохранён!');
  window.location.href = 'polygon.html'; // Перенаправляем на страницу полигона
}

// Функция для отображения существующих SCP-объектов на странице "Полигон"
function displayExistingSCPs() {
  const scpListDiv = document.getElementById('scp-list');
  scpListDiv.innerHTML = ''; // Очищаем список

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const scpObjectString = localStorage.getItem(key);
    const scpObject = JSON.parse(scpObjectString);

    const scpDiv = document.createElement('div');
    scpDiv.className = "addendum"; // Добавляем класс addendum
    scpDiv.innerHTML = `${scpObject.content}`; // Отображаем title и content
    scpListDiv.appendChild(scpDiv);
  }
}
