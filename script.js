/* 
Change this to your own userId

You can get your user ID if you go to this link: https://www.instagram.com/__your_username__/?__a=1
Example: https://www.instagram.com/papaya.cat/?__a=1

Just look for the key "id:", and make sure that this id belongs to your username!

*/
const userId = "49554430966";

/*

Don't need to touch anything below

*/
const totalFetches = 2;
let fetchCounter = 0;

const config = {
  followers: {
    hash: "c76146de99bb02f6415203be841dd25a",
    path: "edge_followed_by",
  },
  following: {
    hash: "d04b0a864b4b54837c0d870b0e77e076",
    path: "edge_follow",
  },
};

var allUsers = {};

async function makeNextRequest(nextCurser, listConfig, addValue) {
  const params = {
    id: userId,
    include_reel: true,
    fetch_mutual: true,
    first: 50,
    after: nextCurser,
  };

  const requestUrl =
    `https://www.instagram.com/graphql/query/?query_hash=` +
    listConfig.hash +
    `&variables=` +
    encodeURIComponent(JSON.stringify(params));

  fetch(requestUrl)
    .then((data) => {
      return data.json();
    })
    .then((json) => {
      const userData = json.data.user[listConfig.path].edges;
      userData.forEach((element) => {
        const userName = element.node.username;
        if (userName in allUsers) {
            allUsers[userName] += addValue;    
        } else {
            allUsers[userName] = addValue
        }
      });

      let curser = "";
      try {
        curser = json.data.user[listConfig.path].page_info.end_cursor;
      } catch {
        console.log("Failed to get cursor");
      }

      if (curser) {
        makeNextRequest(curser, listConfig, addValue);
      } else {
        fetchCounter += 1;
        finished();
      }
    });
}

function printUsers(users) {
    users.forEach(user => {
        console.log(user, `https://www.instagram.com/${user}/`);
    })
}

function prettyPrintResults() {
    let followUsOnly = [];
    let mutual = [];
    let notFollowUs = [];

    for (let userName in allUsers) {
        switch (allUsers[userName]) {
            case 1:
                followUsOnly.push(userName);
                break;
            case 0:
                mutual.push(userName);
                break;
            case -1:
                notFollowUs.push(userName);
                break;
        }
    }
    console.log(`Total of: ${followUsOnly.length} are only following us :)!`);
    console.log("-----------------------------------------------------------------");
    console.log(`Total of: ${mutual.length} are mutual follows :)!`);
    console.log("-----------------------------------------------------------------");
    console.log(`Total of: ${notFollowUs.length} are not following you back :(!`);

    printUsers(notFollowUs)
}

function finished() {
  if (fetchCounter === totalFetches) {
    prettyPrintResults();
  }
}

makeNextRequest("", config.following, -1);
makeNextRequest("", config.followers, 1);
