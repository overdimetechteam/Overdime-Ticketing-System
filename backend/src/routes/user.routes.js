const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const {
  listUsers, createUser, updateUser, resetPassword, deleteUser,
} = require('../controllers/user.controller');

router.use(authenticate, requireAdmin);

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/reset-password', resetPassword);
router.delete('/:id', deleteUser);

module.exports = router;
