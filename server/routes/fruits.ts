import express from 'express'
import { FruitData } from '../../models/fruit.ts'
import checkJwt from '../auth0.ts'
import { JwtRequest } from '../auth0.ts'
import * as db from '../db/fruits.ts'

const router = express.Router()

// GET /api/v1/fruits
router.get('/', async (req, res) => {
  try {
    const fruits = await db.getFruits()
    res.json({ fruits })
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong')
  }
})

// POST /api/v1/fruits
router.post('/', checkJwt, async (req: JwtRequest, res) => {
  const { fruit } = req.body as { fruit: FruitData }
  const auth0Id = req.auth?.sub

  if (!fruit) {
    console.error('No fruit')
    return res.status(400).send('Bad request')
  }

  if (!auth0Id) {
    console.error('No auth0Id')
    return res.status(401).send('Unauthorized')
  }

  try {
    const newFruit = await db.addFruit(fruit, auth0Id)
    res.status(201).json({ fruit: newFruit })
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong')
  }
})

// PUT /api/v1/fruits/:id
router.put('/:id', checkJwt, async (req: JwtRequest, res) => {
  const { fruit } = req.body as { fruit: FruitData }
  const auth0Id = req.auth?.sub
  const id = Number(req.params.id)

  if (!fruit || isNaN(id)) {
    console.error('Bad Request - no fruit or invalid id')
    return res.status(400).send('Bad request')
  }

  if (!auth0Id) {
    console.error('No auth0Id')
    return res.status(401).send('Unauthorized')
  }

  try {
    await db.userCanEdit(id, auth0Id)
    const updatedFruit = await db.updateFruit(id, fruit)
    res.status(200).json({ fruit: updatedFruit })
  } catch (error) {
    console.error(error)
    if (error.message === 'Unauthorized') {
      return res
        .status(403)
        .send('Unauthorized: Only the user who added the fruit may update it')
    }
    res.status(500).send('Something went wrong')
  }
})

// DELETE /api/v1/fruits/:id
router.delete('/:id', checkJwt, async (req: JwtRequest, res) => {
  const id = Number(req.params.id)
  const auth0Id = req.auth?.sub

  if (isNaN(id)) {
    console.error('Invalid fruit id')
    return res.status(400).send('Bad request')
  }

  if (!auth0Id) {
    console.error('No auth0Id')
    return res.status(401).send('Unauthorized')
  }

  try {
    await db.userCanEdit(id, auth0Id)
    await db.deleteFruit(id)
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    if (error.message === 'Unauthorized') {
      return res
        .status(403)
        .send('Unauthorized: Only the user who added the fruit may delete it')
    }
    res.status(500).send('Something went wrong')
  }
})

export default router
