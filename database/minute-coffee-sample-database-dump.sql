-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: minute-coffee
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `order_status` enum('pending','complete','cancelled') NOT NULL,
  `customer_first_name` varchar(60) NOT NULL,
  `customer_last_name` varchar(60) NOT NULL,
  `customer_phone` varchar(45) NOT NULL,
  `customer_email` varchar(60) NOT NULL,
  `order_datetime` datetime NOT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `id_UNIQUE` (`order_id`),
  KEY `product_orders_fk_idx` (`product_id`),
  CONSTRAINT `product_orders_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(45) NOT NULL,
  `product_stock` int NOT NULL,
  `product_price` decimal(10,0) NOT NULL,
  `product_description` varchar(600) NOT NULL,
  `last_updated_by_staff_id` int NOT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `id_UNIQUE` (`product_id`),
  KEY `user_products_fk_idx` (`last_updated_by_staff_id`),
  CONSTRAINT `user_products_fk` FOREIGN KEY (`last_updated_by_staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (5,'Espresso Roberto ',98,10,'An espresso Roberto is a double shot espresso with a small amount of steamed milk on the side. Made properly a splash of steamed whole milk is added.',1),(6,'Espresso romano ',50,10,'An espresso romano is a shot of espresso with a slice of lemon served on the side. The lemon can be run along the rim of the cup as a way to accentuate the espresso\'s sweetness. Despite the name, it has no link to Italy nor Rome.',1),(7,'Flat white',120,5,'A flat white is an espresso with microfoam (steamed milk with small, fine bubbles and a glossy or velvety consistency). It is comparable to a latte, but smaller in volume and with less microfoam, therefore having a higher proportion of coffee to milk, and milk that is more velvety in consistency – allowing the espresso to dominate the flavour, while being supported by the milk. ',1),(8,'Caffè americano ',70,6,'An americano is prepared by adding hot water to espresso, giving a similar strength to but different flavor from brewed coffee. The drink consists of a single or double-shot of espresso combined with between 30 and 473 ml (1 and 16 US fluid ounces; 1 and 17 imperial fluid ounces) of hot water. The strength of an americano varies with the number of shots of espresso added. In the United States, americano is used broadly to mean combining hot water and espresso in either order. Variations include long black and lungo.',1),(9,'Manilo ',130,5,'A manilo consists of a regular espresso shot and less than 100 ml (3.4 US fluid ounces; 3.5 imperial fluid ounces) of silky milk. Popularised due to its strength and taste, without a lot of milk. Similar to a half flat white, but slightly smaller. ',1),(16,'Hot Chocolate',10,5,'A nice hot chocolate drink',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `staff_first_name` varchar(45) NOT NULL,
  `staff_last_name` varchar(45) NOT NULL,
  `staff_access_role` enum('admin','stock','sales') NOT NULL,
  `staff_username` varchar(45) NOT NULL,
  `staff_password` varchar(70) NOT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `user_id_UNIQUE` (`staff_id`),
  UNIQUE KEY `username_UNIQUE` (`staff_username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Jane','Doe','admin','jane','$2a$10$uOcBHAH4LtkuI0qBFIbOU.pj1FdJLC8RKR5oJkgH39/d0Q7SKrxVq'),(2,'John','Doe','sales','john','$2a$10$jPsHpRX16ghAWqescpOq4uxB.K2pYEWfGvp9mOagyY/CDTTCcBSLq'),(3,'Jess','Doe','sales','jess','$2a$10$eJj65YR/bnRW1IN0FwXi7.Sk/3TiAzcUhAL9ByNvCEakZFm90IiKi'),(4,'Jack','Doe','stock','jack','$2a$10$ms9XpSw5J/UAVJJHyBgxSOSK0m3vVxg8cbOMB7PbFoFtjQLmzNFYe');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-22  9:19:09
