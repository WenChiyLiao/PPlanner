import React, { useState, useEffect } from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { nanoid } from "@reduxjs/toolkit"

import styles from "./project.module.scss"

import Navbar from "../Navbar/Navbar"
import ItineraryBoard from "./feature/itineraryBoard/ItineraryBoard"
import CardBoard from "./feature/CardBoard/CardBoard"
import Expenditure from "./feature/Expenditure/Expenditure"
import TodoList from "./feature/TodoList/TodoList"

const Project = () => {
  let { projectId } = useParams()
  let match = useRouteMatch()
  let projects = useSelector((state) => state.projects)
  let itineraryId = useSelector((state) => state.itinerary.id)

  // console.log(match)
  // console.log(projectId)

  return (
    <Switch>
      <Route exact path={match.path}>
        <Navbar type="project" />
        <div className={styles.container}>
          <ul>
            <Link to={`${match.url}/todoList`}>待辦事項</Link>

            <Link to={`${match.url}/cards`}>卡片板</Link>

            <Link to={`${match.url}/itineraries/${itineraryId}`}>行程板</Link>

            <Link to={`${match.url}/expenditure`}>花費板</Link>
          </ul>
        </div>
      </Route>
      <Route path={`${match.path}/itineraries/:itineraryId`}>
        <Navbar type="itineraries" />
        <ItineraryBoard />
      </Route>
      <Route path={`${match.path}/cards`}>
        <Navbar type="cards" />
        <CardBoard />
      </Route>
      <Route path={`${match.path}/expenditure`}>
        <Navbar type="expenditure" />
        <Expenditure />
      </Route>
      <Route path={`${match.path}/todoList`}>
        <Navbar type="todoList" />
        <TodoList />
      </Route>
    </Switch>
  )
}

export default Project