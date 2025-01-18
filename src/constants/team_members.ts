import { body, param } from "express-validator";


export const createTeamMembersValidator = [
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

export const teamMembersByIdValidator = [
    param('id')
        .isString()
        .withMessage('Id is required and must be valid')
]

