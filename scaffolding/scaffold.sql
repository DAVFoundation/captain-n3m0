CREATE TABLE `missions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `need_created_at` datetime DEFAULT NULL,
  `state` enum('need_sent','ready_to_charge','charging','charging_complete') NOT NULL DEFAULT 'need_sent',
  `charging_started_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;