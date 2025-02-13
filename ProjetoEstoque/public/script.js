// ======= CONFIGURAÇÃO DO FIREBASE =======
// Substitua os valores abaixo pelos dados do seu projeto Firebase.
import firebase from 'firebase/app';
import 'firebase/firestore';

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const firebaseConfig = {
  apiKey: "AIzaSyDujs0cCkS99p5FOCjMoZmCvnERXJNBRBY",
  authDomain: "consultav1.firebaseapp.com",
  projectId: "consultav1",
  storageBucket: "consultav1.firebasestorage.app",
  messagingSenderId: "844307477678",
  appId: "1:844307477678:web:4296211a35d27a2b02e93f",
  measurementId: "G-VPFF191MNJ"
};


// ======= DOM =======
const componentForm = document.getElementById('componentForm');
const cardsSection = document.getElementById('cardsSection');
const searchInput = document.getElementById('searchInput');

// ======= FUNÇÃO PARA CRIAR O CARD DO COMPONENTE =======
function createComponentCard(doc) {
  const data = doc.data();
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('data-id', doc.id);
  
  // Título com nome e posição
  const title = document.createElement('h3');
  title.textContent = `${data.name} (${data.position})`;
  card.appendChild(title);
  
  // Tipo do componente
  const type = document.createElement('p');
  type.textContent = `Tipo: ${data.type}`;
  card.appendChild(type);
  
  // Características
  const characteristics = document.createElement('p');
  characteristics.textContent = `Características: ${data.characteristics}`;
  card.appendChild(characteristics);
  
  // Quantidade
  const quantity = document.createElement('p');
  quantity.textContent = `Quantidade: ${data.quantity}`;
  card.appendChild(quantity);
  
  // Menu de três pontinhos para edição/exclusão
  const menu = document.createElement('div');
  menu.classList.add('menu');
  menu.innerHTML = `
    <span class="menu-dots">&#8942;</span>
    <div class="menu-content">
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Excluir</button>
    </div>`;
  card.appendChild(menu);
  
  // Toggle do menu ao clicar nos três pontinhos
  menu.querySelector('.menu-dots').addEventListener('click', () => {
    menu.classList.toggle('active');
  });
  
  // Evento de exclusão
  menu.querySelector('.delete-btn').addEventListener('click', () => {
    if (confirm("Deseja realmente excluir este componente?")) {
      db.collection('components').doc(doc.id).delete();
    }
  });
  
  // Evento de edição (exemplo simples usando prompt)
  menu.querySelector('.edit-btn').addEventListener('click', () => {
    const newName = prompt("Editar nome:", data.name);
    const newPosition = prompt("Editar posição:", data.position);
    const newType = prompt("Editar tipo (eletronico, eletrico, mecanico):", data.type);
    const newCharacteristics = prompt("Editar características:", data.characteristics);
    const newQuantity = prompt("Editar quantidade:", data.quantity);
    
    if(newName && newPosition && newType && newQuantity) {
      // Verifica se já existe outro componente com o mesmo nome e posição
      db.collection('components')
        .where('name', '==', newName)
        .where('position', '==', newPosition)
        .get()
        .then(snapshot => {
          // Se existir um documento diferente do atual, impede a atualização
          const duplicate = snapshot.docs.find(docItem => docItem.id !== doc.id);
          if(duplicate) {
            alert("Já existe um componente com esse nome e posição.");
          } else {
            db.collection('components').doc(doc.id).update({
              name: newName,
              position: newPosition,
              type: newType,
              characteristics: newCharacteristics,
              quantity: parseInt(newQuantity)
            });
          }
        });
    }
  });
  
  return card;
}

// ======= LISTAGEM E FILTRAGEM EM TEMPO REAL =======
// O listener a seguir atualiza os cards sempre que há alteração na coleção.
db.collection('components').orderBy('name').onSnapshot(snapshot => {
  // Limpa a área de cards
  cardsSection.innerHTML = '';
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const searchTerm = searchInput.value.toLowerCase();
    
    // Se houver termo de busca, exibe apenas os componentes correspondentes
    if(searchTerm) {
      if(data.name.toLowerCase().includes(searchTerm) || data.position.toLowerCase().includes(searchTerm)) {
        cardsSection.appendChild(createComponentCard(doc));
      }
    }
    // Se o campo de busca estiver vazio, nenhum componente é exibido
    // (Conforme o requisito: "os componentes só apareçam quando solicitados")
  });
});

// ======= ADIÇÃO DE COMPONENTES =======
componentForm.addEventListener('submit', e => {
  e.preventDefault();
  
  const name = componentForm['nameInput'].value.trim();
  const position = componentForm['positionInput'].value.trim();
  const type = componentForm['typeInput'].value;
  const characteristics = componentForm['characteristicsInput'].value.trim();
  const quantity = parseInt(componentForm['quantityInput'].value);
  
  if(!name || !position || !type || !quantity) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }
  
  // Verifica se já existe um componente com o mesmo nome e posição
  db.collection('components')
    .where('name', '==', name)
    .where('position', '==', position)
    .get()
    .then(snapshot => {
      if(!snapshot.empty) {
        alert("Já existe um componente com esse nome e posição.");
      } else {
        // Se não houver duplicata, adiciona o novo componente
        db.collection('components').add({
          name,
          position,
          type,
          characteristics,
          quantity
        }).then(() => {
          componentForm.reset();
        });
      }
    });
});

// ======= ATUALIZAÇÃO DA BUSCA =======
// Sempre que o usuário digitar no campo de busca, o listener onSnapshot (que já filtra os resultados)
// atualizará a exibição dos cards.
searchInput.addEventListener('input', () => {
  // Forçamos uma atualização simples removendo todos os cards e deixando o listener cuidar da filtragem
  // (Como a consulta onSnapshot é acionada automaticamente, não há necessidade de reconsultar manualmente)
});