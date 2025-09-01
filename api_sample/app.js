const url = "https://valorant-api.com/v1/agents/";
const agentUUID = "7f94d92c-4234-0a36-9646-3a87eb8b5c89";

async function testData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}

async function getAgent() {
  try {
    const response = await fetch(`${url}${agentUUID}`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error.message);
  }
}

async function displayAgent() {
    const agent = await getAgent();
    const container = document.getElementById("agent-container");
    if (agent) {
        console.log(agent);
        container.innerHTML = `
            <h2>${agent.displayName}</h2>
            <p>${agent.description}</p>
            <img src="${agent.fullPortrait}" alt="${agent.displayName}">
        `;
    }
}

// testData();
getAgent();
displayAgent();
