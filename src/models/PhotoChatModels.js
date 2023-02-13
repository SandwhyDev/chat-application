const { PrismaClient } = require("@prisma/client");

const PhotoChat = new PrismaClient().photoChat;

module.exports = PhotoChat;
