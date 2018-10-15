DROP TABLE IF EXISTS `missions`;
CREATE TABLE `missions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `state` enum('need_sent','ready_to_charge','charging','charging_complete') NOT NULL DEFAULT 'need_sent',
  `need_created_at` datetime DEFAULT NULL,
  `charging_started_at` datetime DEFAULT NULL,
  `charging_completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;