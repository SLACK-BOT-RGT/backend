import { body, param } from "express-validator";


export const createUserValidator = [
    body('email')
        .isEmail()
        .withMessage('Email is required and must be valid'),
    body('name')
        .isString()
        .withMessage('Name is required and must be valid'),
    body('id')
        .isString()
        .withMessage('Id is required and must be valid'),
    body('timeZone')
        .isString()
        .withMessage('timeZone is required and must be valid'),
]

export const userByIdValidator = [
    param('id')
        .isString()
        .withMessage('Id is required and must be valid')
]

export const createTeamValidator = [
    body('name')
        .isString()
        .withMessage('Name is required and must be valid'),
    body('description')
        .isString()
        .withMessage('timeZone is required and must be valid'),
]

export const teamByIdValidator = [
    param('id')
        .isString()
        .withMessage('Id is required and must be valid')
]

export const createTeamMembersValidator = [
    body('role')
        .isString()
        .withMessage('Role is required and must be valid'),
    body('user_id')
        .isString()
        .withMessage('User Id is required and must be valid'),
    body('team_id')
        .isString()
        .withMessage('Team Id is required and must be valid'),
]

export const teamMembersByIdValidator = [
    param('id')
        .isString()
        .withMessage('Id is required and must be valid')
]

export const createStandupConfigValidator = [
    body('team_id')
        .isString()
        .withMessage('Team Id is required and must be valid'),
    body('questions')
        .isString()
        .withMessage('Questions are required and must be valid'),
    body('reminder_days')
        .isString()
        .withMessage('Reminder days are required and must be valid'),
    body('reminder_time')
        .isString()
        .withMessage('Reminder time is required and must be valid'),
    body('due_time')
        .isString()
        .withMessage('Due time is required and must be valid'),
]

