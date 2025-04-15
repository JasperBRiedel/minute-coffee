-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: minute-coffee-2025
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `role` enum('admin','stock','sales') NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(70) NOT NULL,
  `deleted` tinyint NOT NULL DEFAULT '0',
  `authentication_key` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE` (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Jane','Doe','admin','jane','$2a$10$uOcBHAH4LtkuI0qBFIbOU.pj1FdJLC8RKR5oJkgH39/d0Q7SKrxVq',0,NULL),(2,'John','Doe','sales','john','$2a$10$jPsHpRX16ghAWqescpOq4uxB.K2pYEWfGvp9mOagyY/CDTTCcBSLq',0,NULL),(3,'Jess','Doe','sales','jess','$2a$10$eJj65YR/bnRW1IN0FwXi7.Sk/3TiAzcUhAL9ByNvCEakZFm90IiKi',0,NULL),(4,'Jack','Doe','stock','jack','$2a$10$ms9XpSw5J/UAVJJHyBgxSOSK0m3vVxg8cbOMB7PbFoFtjQLmzNFYe',0,NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `status` enum('pending','complete','cancelled') NOT NULL,
  `created` datetime NOT NULL,
  `customer_first_name` varchar(60) NOT NULL,
  `customer_last_name` varchar(60) NOT NULL,
  `customer_phone` varchar(45) NOT NULL,
  `customer_email` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `product_orders_fk_idx` (`product_id`),
  CONSTRAINT `product_orders_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (23,6,'cancelled','2025-02-10 07:01:10','Jake','Bane','0445555666','jakebane@email.com'),(27,5,'complete','2025-02-10 11:59:21','&*^*&%*))&','','',''),(28,6,'complete','2025-02-10 13:27:24','Test\'','O\'Hello-World','','hello@world.test'),(29,6,'pending','2025-02-10 13:27:31','Test\'5','O\'Hello-World','','hello@world.test'),(30,6,'pending','2025-02-10 13:28:13','Test\'','O\'Hello-World','','hello@world.test'),(31,6,'cancelled','2025-02-10 13:35:55','Test\'','O\'Hello-World','0400000000','hello@world.test'),(32,6,'pending','2025-02-10 13:36:05','Test\'','O\'Hello-World','0400000000','hello@world.test'),(33,6,'cancelled','2025-02-10 13:36:09','Test\'','O\'Hello-World','040000000','hello@world.test'),(34,6,'complete','2025-02-10 13:36:12','Test\'','O\'Hello-World','04000000','hello@world.test'),(35,6,'pending','2025-02-10 13:36:15','Test\'','O\'Hello-World','040','hello@world.test'),(36,6,'cancelled','2025-02-10 13:36:23','Test\'','O\'Hello-World','+61400000000','hello@world.test'),(37,6,'cancelled','2025-02-10 13:39:31','Test&#x27;','O&#x27;Hello-World','0000000000','hello@world.test'),(38,6,'pending','2025-02-10 13:41:03','Test&#x27;','O&#x27;Hello-World','0000000000','hello@world.test');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `stock` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` varchar(600) NOT NULL,
  `updated_by_employee_id` int NOT NULL,
  `deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `user_products_fk_idx` (`updated_by_employee_id`),
  CONSTRAINT `user_products_fk` FOREIGN KEY (`updated_by_employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (5,'Espresso Roberto ',95,4.50,'An espresso Roberto is a double shot espresso with a small amount of steamed milk on the side. Made properly a splash of steamed whole milk is added.',4,0),(6,'Espresso Romano ',35,4.40,'An espresso romano is a shot of espresso with a slice of lemon served on the side. The lemon can be run along the rim of the cup as a way to accentuate the espresso\'s sweetness. Despite the name, it has no link to Italy nor Rome.',1,0),(7,'Flat white',119,2.60,'A flat white is an espresso with microfoam (steamed milk with small, fine bubbles and a glossy or velvety consistency). It is comparable to a latte, but smaller in volume and with less microfoam, therefore having a higher proportion of coffee to milk, and milk that is more velvety in consistency – allowing the espresso to dominate the flavour, while being supported by the milk. ',1,0),(8,'Caffè americano ',70,3.20,'An americano is prepared by adding hot water to espresso, giving a similar strength to but different flavor from brewed coffee. The drink consists of a single or double-shot of espresso combined with between 30 and 473 ml (1 and 16 US fluid ounces; 1 and 17 imperial fluid ounces) of hot water. The strength of an americano varies with the number of shots of espresso added. In the United States, americano is used broadly to mean combining hot water and espresso in either order. Variations include long black and lungo.',4,0),(9,'Manilo ',130,4.00,'A manilo consists of a regular espresso shot and less than 100 ml (3.4 US fluid ounces; 3.5 imperial fluid ounces) of silky milk. Popularised due to its strength and taste, without a lot of milk. Similar to a half flat white, but slightly smaller. ',1,0),(16,'Hot Chocolate',10,2.00,'A nice hot chocolate drink',1,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `discount_percentage` decimal(3,2) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `sales_product_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,5,0.50,'2025-02-18','09:00:00','15:00:00'),(2,6,0.50,'2025-04-23','09:00:00','15:00:00'),(3,8,0.50,'2025-04-19','09:00:00','15:00:00'),(4,9,0.50,'2025-04-23','09:00:00','15:00:00'),(5,6,0.75,'2025-04-20','10:00:00','12:00:00'),(7,16,0.50,'2025-02-19','09:00:00','16:00:00');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-15 11:24:00
