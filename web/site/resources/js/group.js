function registerDelete(tokenClient) {
  const button = document.querySelector("#bDelete");
  button.onclick = handleClick;
  console.log("button:", button);

  async function handleClick() {
    alert("click delete");
    const groupId = window.location.pathname.split("/").pop();
    console.log(`groupId: ${groupId}`);

    const uriDelete = `/api/groups/${groupId}`;
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenClient}`,
        "Content-Type": "application/json",
      },
    };
    const rsp = await fetch(uriDelete, options);
    if (rsp.ok) {
      alert(`group with id ${groupId} deleted`);
      window.location = "/groups";
    }
  }
}

function registerUpdate(tokenClient) {
  const button = document.querySelector("#bSave");

  button.onclick = handleClick;
  console.log("button:", button);

  async function handleClick() {
    alert("click save");
    const groupId = window.location.pathname.split("/").at(-2);
    console.log(groupId);
    const name = document.querySelector("#name").value;
    const description = document.querySelector("#description").value;

    alert(`click ${name} ${description}`);
    console.log(JSON.stringify({ name, description }));

    const uriUpdate = `/api/groups/${groupId}`;
    const options = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokenClient}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    };

    const rsp = await fetch(uriUpdate, options);
    if (rsp.ok) {
      alert(`Group with id ${groupId} updated`);
      window.location = "/groups";
    }
  }
}

function registerAddMovie(tokenClient) {
  const button = document.querySelector("#bAddMovie");
  button.onclick = handleClick;
  console.log("button:", button);

  async function handleClick() {
    alert("click add movie");
    const movieId = window.location.pathname.split("/").pop();
    const groupId = document.querySelector("#groupId").value;
    console.log(movieId);
    console.log(groupId);
    const uriAddMovie = `/api/groups/${groupId}/movies/${movieId}`;
    const options = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokenClient}`,
      },
    };
    const rsp = await fetch(uriAddMovie, options);
    if (rsp.ok) {
      alert(`Movie with id ${movieId} added to group with id ${groupId}`);
      window.location = "/groups";
    }
  }
}

function registerRemoveMovie(tokenClient) {
  const button = document.querySelector("#bRemoveMovie");
  button.onclick = handleClick;
  console.log("button:", button);

  async function handleClick() {
    alert("click remove movie");
    const groupId = window.location.pathname.split("/").pop();
    console.log(groupId);

    const uriRemoveMovie = `/api/groups/${groupId}/movies/${movieId}`;
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenClient}`,
        "Content-Type": "application/json",
      },
    };
    const rsp = await fetch(uriRemoveMovie, options);
    if (rsp.ok) {
      alert(`Movie with id ${movieId} removed from group with id ${groupId}`);
      window.location = "/groups";
    }
  }
}
