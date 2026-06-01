import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// Curated recommendation catalog (would be algorithmic in a real product)
const CATALOG = {
  book: [
    { title: 'The Name of the Wind', subtitle: 'Patrick Rothfuss', coverColor: '#2A1A0E', description: 'A legendary figure tells the story of his own extraordinary life.' },
    { title: 'Project Hail Mary', subtitle: 'Andy Weir', coverColor: '#0D1A2A', description: 'A lone astronaut must save the earth from disaster.' },
    { title: 'Lessons in Chemistry', subtitle: 'Bonnie Garmus', coverColor: '#2A2010', description: 'A female chemist becomes the star of a TV cooking show in the 1960s.' },
    { title: 'The Covenant of Water', subtitle: 'Abraham Verghese', coverColor: '#0A2010', description: 'An epic of a family in India across three generations.' },
    { title: 'Intermezzo', subtitle: 'Sally Rooney', coverColor: '#1A0A2A', description: 'Two brothers come to terms with their father\'s death in very different ways.' },
    { title: 'James', subtitle: 'Percival Everett', coverColor: '#1A1A0A', description: 'A reimagining of Adventures of Huckleberry Finn from Jim\'s perspective.' },
  ],
  film: [
    { title: 'Past Lives', subtitle: 'Celine Song', coverColor: '#0D1528', description: 'Two childhood sweethearts reunite decades later in New York.' },
    { title: 'All of Us Strangers', subtitle: 'Andrew Haigh', coverColor: '#20100D', description: 'A screenwriter bonds with his neighbor and revisits his childhood home.' },
    { title: 'Oppenheimer', subtitle: 'Christopher Nolan', coverColor: '#1A1A0A', description: 'The story of J. Robert Oppenheimer and the atomic bomb.' },
    { title: 'The Zone of Interest', subtitle: 'Jonathan Glazer', coverColor: '#0D200D', description: 'The mundane life of the Auschwitz commandant and his family.' },
    { title: 'Monster', subtitle: 'Hirokazu Kore-eda', coverColor: '#0A1A2A', description: 'A mystery told from three perspectives — a mother, a teacher, and students.' },
    { title: 'Dune: Part Two', subtitle: 'Denis Villeneuve', coverColor: '#2A1A00', description: 'Paul Atreides continues his journey among the Fremen of Arrakis.' },
  ],
  podcast: [
    { title: 'Serial', subtitle: 'Sarah Koenig', coverColor: '#0D2020', description: 'Investigative journalism told in a serialized format.' },
    { title: 'Conan O\'Brien Needs a Friend', subtitle: 'Team Coco', coverColor: '#200D00', description: 'Conan hilariously attempts to make friends with celebrities.' },
    { title: 'Hard Fork', subtitle: 'NYT Technology', coverColor: '#0D0D20', description: 'Making sense of the rapidly changing world of tech.' },
    { title: 'Normal Gossip', subtitle: 'Kelsey McKinney', coverColor: '#200D20', description: 'Delightful, absurd, real gossip about real people.' },
    { title: '99% Invisible', subtitle: 'Roman Mars', coverColor: '#1A200D', description: 'The unnoticed design and architecture that shapes our world.' },
    { title: 'Maintenance Phase', subtitle: 'Aubrey Gordon & Michael Hobbes', coverColor: '#201A0D', description: 'Debunking the junk science behind health and wellness.' },
  ],
  game: [
    { title: 'Elden Ring', subtitle: 'FromSoftware', coverColor: '#1A1028', description: 'An action RPG set in the Lands Between, a dark fantasy world.' },
    { title: 'Hades II', subtitle: 'Supergiant Games', coverColor: '#200D1A', description: 'The underworld princess battles through Greek mythology.' },
    { title: 'Balatro', subtitle: 'LocalThunk', coverColor: '#1A0A0A', description: 'A roguelike poker-inspired deck builder that\'s utterly addictive.' },
    { title: 'Animal Crossing: New Horizons', subtitle: 'Nintendo', coverColor: '#0D2010', description: 'Build your dream island life at your own pace.' },
    { title: 'The Forgotten City', subtitle: 'Modern Storyteller', coverColor: '#1A1400', description: 'A narrative mystery in ancient Rome with a dark twist.' },
    { title: 'Disco Elysium', subtitle: 'ZA/UM', coverColor: '#0D1A20', description: 'A groundbreaking RPG about a detective with amnesia.' },
  ],
}

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  const interests = JSON.parse(user?.interests || '[]')

  const myClubIds = (await prisma.clubMember.findMany({
    where: { userId: req.userId }, select: { clubId: true }
  })).map(m => m.clubId)

  const myClubs = await prisma.club.findMany({ where: { id: { in: myClubIds } } })
  const myTypes = [...new Set(myClubs.map(c => c.type))]

  const activeTypes = interests.length > 0 ? interests : (myTypes.length > 0 ? myTypes : ['book', 'film', 'podcast', 'game'])

  const rows = activeTypes.slice(0, 4).map(type => ({
    type,
    label: { book: 'Books', film: 'Films', podcast: 'Podcasts', game: 'Games' }[type] || type,
    items: (CATALOG[type] || []).map((item, i) => ({ id: `${type}-${i}`, ...item, type })),
  }))

  const featured = rows[0]?.items[0] || CATALOG.book[0]

  res.json({ featured: { ...featured, type: activeTypes[0] }, rows })
}))

export default router
