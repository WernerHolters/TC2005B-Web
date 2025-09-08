const url = "https://valorant-api.com/v1/agents/";
let allAgents = [];

function fetchAgents() {
  fetch(url)
    .then(response => response.json())
    .then(data => { 
      allAgents = data.data;
      displayAgents(allAgents);
    })
    .catch(error => console.error('Error fetching agents:', error));
}

function displayAgents(agents) {
  const agentsList = document.getElementById('agents-container');
  agentsList.innerHTML = '';

  agents.forEach(agent => {
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
}

function searchAgents() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.toLowerCase();
  
  const filteredAgents = allAgents.filter(agent => 
    agent.displayName.toLowerCase().includes(searchTerm)
  );
  
  displayAgents(filteredAgents);
}

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', searchAgents);
  
  fetchAgents();
});
