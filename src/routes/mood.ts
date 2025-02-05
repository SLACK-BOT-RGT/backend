import express, { type Router } from "express"
import {
  createMoodCheckinRequest,
  getMoodCheckinsRequest,
  getTeamMoodAnalyticsRequest,
} from "../controllers/mood"

const router: Router = express.Router()

// Create a new mood check-in
router.post("/", createMoodCheckinRequest as express.RequestHandler)

// Get mood check-ins with optional filters
router.get("/", getMoodCheckinsRequest as express.RequestHandler)

// Get team mood analytics
router.get("/analytics/:team_id", getTeamMoodAnalyticsRequest as express.RequestHandler)

export default router

