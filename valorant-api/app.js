const url = "https://valorant-api.com/v1/agents/";
let allAgents = [];
let currentAgents = [];
let currentPage = 1;
const agentsPerPage = 6;

function fetchAgents() {
  fetch(url)
    .then(response => response.json())
    .then(data => { 
      allAgents = data.data;
      currentAgents = allAgents;
      currentPage = 1;
      displayAgents();
    })
    .catch(error => console.error('Error fetching agents:', error));
}

function displayAgents() {
  const agentsList = document.getElementById('agents-container');
  agentsList.innerHTML = '';

  const startIndex = (currentPage - 1) * agentsPerPage;
  const endIndex = startIndex + agentsPerPage;
  const agentsToShow = currentAgents.slice(startIndex, endIndex);

  agentsToShow.forEach(agent => {
    const agentCard = document.createElement('div');
    agentCard.className = 'agent-card';
    
    const img = document.createElement('img');
    img.src = agent.displayIcon;
    img.alt = agent.displayName;
    
    const name = document.createElement('p');
    name.textContent = agent.displayName;
    
    agentCard.appendChild(img);
    agentCard.appendChild(name);
    agentsList.appendChild(agentCard);
  });

  updatePagination();
}

function searchAgents() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.toLowerCase();
  
  currentAgents = allAgents.filter(agent => 
    agent.displayName.toLowerCase().includes(searchTerm)
  );
  
  currentPage = 1;
  displayAgents();
}

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', searchAgents);
  
  fetchAgents();
});

function updatePagination() {
  const totalPages = Math.ceil(currentAgents.length / agentsPerPage);
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayAgents();
  }
}

function nextPage() {
  const totalPages = Math.ceil(currentAgents.length / agentsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayAgents();
  }
}
