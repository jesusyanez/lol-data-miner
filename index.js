const axios = require("axios");

// Gets full data on X amount of matches
exports.getRecentMatches = async function (
  server,
  summonerName,
  queue,
  games,
  apiKey
) {
  try {
    const queueType = await adjustQueue(queue);
    const regionCodes = await getRegionCodes(server);
    const accountId = await getAccountId(regionCodes[0], summonerName, apiKey);
    // console.log(accountId);
    // API endpoint for match id list
    const matchListEndpoint = `https://${regionCodes[1]}.api.riotgames.com/lol/match/v5/matches/by-puuid/{accountId}/ids?${queueType}&start=0&count=${games}&api_key=${apiKey}`;
    //API endpoint for detail match data
    const matchDetailEndpoint = `https://${regionCodes[1]}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key=${apiKey}`;
    const matchListResponse = await axios.get(
      matchListEndpoint.replace("{accountId}", accountId)
    );
    const matchIds = matchListResponse.data;
    // console.log(matchIds);
    const requests = matchIds.map((matchId) =>
      axios.get(matchDetailEndpoint.replace("{matchId}", matchId))
    );
    const responses = await Promise.all(requests);
    const matches = responses.map((response) => response.data);
    // const completeData = {
    //   user: summonerName,
    //   puuid: accountId,
    //   matches: matchIds,
    //   matchData: matches,
    // };
    // return completeData;
    return matches;
  } catch (err) {
    console.log(err);
  }
};

// Gets puuid from summonerName
async function getAccountId(region, summonerName, apiKey) {
  try {
    const summonerEndpoint = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`;
    const summonerResponse = await axios.get(summonerEndpoint);
    return summonerResponse.data.puuid;
  } catch (err) {
    console.log(err);
  }
}

// Gets specific API region prefix for server
async function getRegionCodes(server) {
  try {
    const regionCodes = {
      na: ["na1", "americas"],
      lan: ["la1", "americas"],
      las: ["la1", "americas"],
      br: ["br1", "americas"],
      oce: ["oc1", "americas"],
      eune: ["eun1", "europe"],
      euw: ["euw1", "europe"],
      tr: ["tr1", "europe"],
      ru: ["ru", "europe"],
      jp: ["jp1", "asia"],
      kr: ["kr", "asia"],
      ph: ["ph1", "sea"],
      sg: ["sg2", "sea"],
      th: ["th2", "sea"],
      tw: ["tw2", "sea"],
      vn: ["vn2", "sea"],
    };
    const codes = regionCodes[server];
    return codes;
  } catch (err) {
    console.log(err);
  }
}

// Adjusts the API query for selected queue
async function adjustQueue(queue) {
  try {
    if (queue == "all") {
      return "type=";
    }
    return "type=" + queue;
  } catch (err) {
    console.log(err);
  }
}
