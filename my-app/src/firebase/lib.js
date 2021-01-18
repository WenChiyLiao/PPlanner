import firebase from "firebase/app"
import "firebase/analytics"
import "firebase/auth"
import "firebase/firestore"
import firebaseConfig from "./config"

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Abbreviation
const db = firebase.firestore()
const au = firebase.auth()

export const checkUserStatus = (handleUser, handleNoUser) => {
  au.onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      handleUser(user)
    } else {
      // No user is signed in.
      handleNoUser()
    }
  })
}

export const signUp_Native = (input, handleSuccess) => {
  au.createUserWithEmailAndPassword(input.email, input.password)
    .then((result) => {
      let user = result.user
      let docRef = db.collection("users").doc(user.uid)

      let update = {
        name: input.name,
        email: user.email,
        picture: user.photoURL,
      }
      docRef.set(update).catch(function (error) {
        console.error("Error adding document: ", error)
      })
    })
    .then((res) => {
      handleSuccess()
    })
    .catch((error) => {
      var errorCode = error.code
      var errorMessage = error.message
      alert(errorMessage)
      // ..
    })
}

export const signIn_Native = (input, handleSuccess) => {
  return au
    .signInWithEmailAndPassword(input.email, input.password)
    .then((user) => {
      // Signed in
      // ...
      handleSuccess()
    })
    .catch((error) => {
      var errorCode = error.code
      var errorMessage = error.message
      alert(errorMessage)
    })
}

export const signOut = (redirect) => {
  return au
    .signOut()
    .then(function () {
      // Sign-out successful.
      redirect()
    })
    .catch(function (error) {
      // An error happened.
    })
}

export const updateProjectInUser_Fs = (userId, type, projectId) => {
  const docRef = db.collection("users").doc(userId)
  const change = {}

  if (type === "add") {
    change.projects = firebase.firestore.FieldValue.arrayUnion(projectId)
  }
  if (type === "remove") {
    change.projects = firebase.firestore.FieldValue.arrayRemove(projectId)
  }

  return docRef.update(change).catch(function (error) {
    console.error("Error updating document: ", error)
  })
}

//////listening to cloud data///////
export const listenToUser = (userId, updateState) => {
  let unsubscribe = db
    .collection("users")
    .doc(userId)
    .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
      let data = snapshot.data()
      data.id = snapshot.id
      updateState(data)
    })
  return unsubscribe
}

export const listenToMembers = (
  projectId,
  handleAdd,
  handleModify,
  handleRemove
) => {
  let unsubscribe = db
    .collection("users")
    .where("projects", "array-contains", projectId)
    .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
      var docChange = snapshot.docChanges()
      var source = snapshot.metadata.hasPendingWrites ? "local" : "server"

      //local data needs to be changed
      if (docChange.length > 0) {
        snapshot.docChanges().forEach(function (change) {
          let type = change.type
          let id = change.doc.id
          let data = change.doc.data()

          //add id to data
          data.id = id

          if (type === "added") {
            handleAdd(data, source)
          }
          if (type === "modified") {
            handleModify(data, source)
          }
          if (type === "removed") {
            handleRemove(data, source)
          }
        })
      }
    })
  return unsubscribe
}

export const listenToProjects = (userId, handleUpdate) => {
  return db
    .collection("projects")
    .where("members", "array-contains", userId)
    .orderBy("created_time", "desc")
    .onSnapshot((snapshot) => {
      const docChange = snapshot.docChanges()

      if (docChange.length > 0) {
        const temp = []
        snapshot.forEach((doc) => {
          const id = doc.id
          const data = doc.data()
          data.id = id
          data.created_time = data.created_time.toDate().toString()
          temp.push(data)
        })
        handleUpdate(temp)
      }
    })
}

export const listenToCards = (projectId, handleUpdate) => {
  return db
    .collection("projects")
    .doc(projectId)
    .collection("cards")
    .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
      var docChange = snapshot.docChanges()
      if (docChange.length > 0) {
        const temp = []
        snapshot.docChanges().forEach(function (change) {
          const data = change.doc.data()
          data.id = change.doc.id
          data.type = change.type
          if (data.start_time) {
            data.start_time = data.start_time.toDate().toString()
            data.end_time = data.end_time.toDate().toString()
          }
          temp.push(data)
        })
        handleUpdate(temp)
      }
    })
}

export const ListenToCardsRelatedData = (field, cardId, handleChange) => {
  const unsubscribe = db
    .collection(field)
    .where("card_id", "==", cardId)
    .orderBy("date", "asc")
    .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
      const docChange = snapshot.docChanges()
      const source = snapshot.metadata.hasPendingWrites ? "local" : "server"

      if (docChange.length > 0) {
        docChange.forEach(function (change) {
          const data = change.doc.data()
          data.id = change.doc.id
          data.date = data.date.toDate().toString()
          handleChange(change.type, data, source)
        })
      }
    })
  return unsubscribe
}

export const listenToComments = (
  cardId,
  handleAdd,
  handleModify,
  handleRemove
) => {
  let unsubscribe = db
    .collection("comments")
    .where("card_id", "==", cardId)
    .orderBy("date", "asc")
    .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
      var docChange = snapshot.docChanges()
      var source = snapshot.metadata.hasPendingWrites ? "local" : "server"

      //local data needs to be changed
      if (docChange.length > 0) {
        snapshot.docChanges().forEach(function (change) {
          let type = change.type
          let id = change.doc.id
          let data = change.doc.data()
          data.id = id
          data.date = data.date.toDate().toString()

          if (type === "added") {
            handleAdd(data, source)
          }
          if (type === "modified") {
            handleModify(data, source)
          }
          if (type === "removed") {
            handleRemove(data, source)
          }
        })
      }
    })
  return unsubscribe
}

export const listenToLinks = (
  cardId,
  handleAdd,
  handleModify,
  handleRemove
) => {
  let unsubscribe = db
    .collection("links")
    .where("card_id", "==", cardId)
    .orderBy("date", "asc")
    .onSnapshot({ includeMetadataChanges: true }, function (snapshot) {
      var docChange = snapshot.docChanges()
      var source = snapshot.metadata.hasPendingWrites ? "local" : "server"

      //local data needs to be changed
      if (docChange.length > 0) {
        snapshot.docChanges().forEach(function (change) {
          let type = change.type
          let id = change.doc.id
          let data = change.doc.data()
          data.id = id
          data.date = data.date.toDate().toString()

          if (type === "added") {
            handleAdd(data, source)
          }
          if (type === "modified") {
            handleModify(data, source)
          }
          if (type === "removed") {
            handleRemove(data, source)
          }
        })
      } else {
        //changes have been saved
        // console.log("data has been saved to cloud database")
      }
    })
  return unsubscribe
}

export const updateProjectMember_Fs = (projectId, type, targetUserId) => {
  let docRef = db.collection("projects").doc(projectId)
  let change

  if (type === "add") {
    change = {
      members: firebase.firestore.FieldValue.arrayUnion(targetUserId),
    }
  }
  if (type === "remove") {
    change = {
      members: firebase.firestore.FieldValue.arrayRemove(targetUserId),
    }
  }

  return docRef.update(change).catch(function (error) {
    console.error("Error updating document: ", error)
  })
}

//get info once
export const getProject_Fs = (projectId) => {
  const docRef = db.collection("projects").doc(projectId)

  return docRef
    .get()
    .then(function (doc) {
      return doc.data()
    })
    .catch(function (error) {
      console.log("Error getting document:", error)
    })
}

const getDocRef = (method, type, docId) => {
  if (Array.isArray(type)) {
    if (method === "add") {
      return db.collection(type[0]).doc(docId[0]).collection(type[1])
    } else {
      return db
        .collection(type[0])
        .doc(docId[0])
        .collection(type[1])
        .doc(docId[1])
    }
  } else {
    if (method === "add") {
      return db.collection(type)
    } else {
      return db.collection(type).doc(docId)
    }
  }
}

const updateData = (method, type, docId, input) => {
  const docRef = getDocRef(method, type, docId)

  switch (method) {
    case "add": {
      return docRef.add(input).catch(function (error) {
        console.error("Error adding document: ", error)
      })
    }

    case "remove": {
      return docRef.delete().catch(function (error) {
        console.error("Error deleting document: ", error)
      })
    }

    default: {
      return docRef.update(input).catch(function (error) {
        console.error("Error updating document: ", error)
      })
    }
  }
}

export const FS = {
  projects: {
    add: (input) => updateData("add", "projects", null, input),
    update: (docId, input) => updateData("update", "projects", docId, input),
    remove: (docId) => updateData("remove", "projects", docId),
  },
  cards: {
    add: (projectId, input) =>
      updateData("add", ["projects", "cards"], [projectId], input),
    update: (projectId, cardId, input) =>
      updateData("update", ["projects", "cards"], [projectId, cardId], input),
    remove: (projectId, cardId) =>
      updateData("remove", ["projects", "cards"], [projectId, cardId]),
  },
  links: {
    add: (input) => updateData("add", "links", null, input),
    update: (docId, input) => updateData("update", "links", docId, input),
    remove: (docId) => updateData("remove", "links", docId),
  },
  comments: {
    add: (input) => updateData("add", "comments", null, input),
    update: (docId, input) => updateData("update", "comments", docId, input),
    remove: (docId) => updateData("remove", "comments", docId),
  },
}
