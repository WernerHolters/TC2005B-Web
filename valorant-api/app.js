const url = "https://valorant-api.com/v1/agents/";

function agentsData() {
  fetch(url)
  .then(response => response.json())
  .then(data => {
    const agents = data.data;
    const agentIds = agents.map(agent => agent.uuid);
    const agentNames = agents.map(agent => agent.displayName);
    console.log(agents);
  })
  .catch(error => console.error('Error fetching agents:', error));
}

function fetchAgents() {
  fetch(url)
    .then(response => response.json())
    .then(data => { 
      const agents = data.data;
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
    })
    .catch(error => console.error('Error fetching agents:', error));
}

agentsData();
fetchAgents();
