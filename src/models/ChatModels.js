const { PrismaClient } = require("@prisma/client");

const ChatModels = new PrismaClient().chat;

module.exports = ChatModels;
