CREATE TABLE `account` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) unsigned NOT NULL COMMENT '用户id',
  `source` tinyint(4) unsigned NOT NULL COMMENT '来源 1 用户 2 运营',
  `account` varchar(30) NOT NULL COMMENT '账号',
  `pwd` varchar(255) NOT NULL COMMENT 'pwd',
  `token` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`account`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `order` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `uid` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `order_number` varchar(50) NOT NULL COMMENT '订单号',
  `buy_time` bigint(20) NOT NULL COMMENT '购买时间,以秒为单位',
  `num` int(11) NOT NULL COMMENT '数量',
  `sku_number` varchar(50) NOT NULL COMMENT '商品sku',
  `price` int(11) NOT NULL DEFAULT '0' COMMENT '价格,以分为单位',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '订单状态, 0表示支付中 1支付成功 2支付失败',
  `version` int(11) NOT NULL DEFAULT '0' COMMENT 'version',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

CREATE TABLE `sku` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `sku_number` varchar(50) NOT NULL COMMENT 'SKU编号',
  `title` varchar(100) NOT NULL COMMENT 'sku title',
  `num` int(10) DEFAULT '0' COMMENT '库存数量',
  `spu_number` varchar(50) NOT NULL COMMENT 'SPU编号，参考spu表',
  `image` varchar(200) NOT NULL DEFAULT '' COMMENT '商品图片',
  `price` int(11) NOT NULL COMMENT 'SKU价格',
  `is_sale` tinyint(4) DEFAULT '0' COMMENT '是否上架, 0已下架，1已上架',
  `is_deleted` tinyint(4) DEFAULT '0' COMMENT '是否删除,0:未删除，1：已删除',
  `updated_by` bigint(20) NOT NULL COMMENT '用户id',
  `version` int(11) NOT NULL DEFAULT '1' COMMENT '版本',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_hot` tinyint(4) unsigned DEFAULT '0' COMMENT '热点商品',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sku_number` (`sku_number`),
  KEY `is_deleted` (`is_deleted`,`is_sale`),
  KEY `spu_number` (`spu_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU表';

CREATE TABLE `sku_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `sku_number` varchar(50) NOT NULL COMMENT 'SKU编号',
  `spu_number` varchar(50) NOT NULL COMMENT 'SPU编号',
  `updated_by` bigint(20) NOT NULL COMMENT '用户id',
  `bundle` text NOT NULL COMMENT 'SKU属性',
  `version` int(11) NOT NULL DEFAULT '1' COMMENT 'sku 版本',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_sku_number_created_at` (`sku_number`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SKU历史记录表';

CREATE TABLE `spu` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `spu_number` varchar(50) NOT NULL COMMENT 'spu编号',
  `name` varchar(100) NOT NULL COMMENT 'SPU标题',
  `intro` varchar(255) NOT NULL DEFAULT '' COMMENT '简介',
  `image` varchar(255) NOT NULL DEFAULT '' COMMENT '图片列表',
  `is_deleted` tinyint(4) DEFAULT '0' COMMENT '是否删除,0:未删除，1：已删除',
  `updated_by` bigint(20) NOT NULL COMMENT '用户id',
  `version` int(11) NOT NULL DEFAULT '1' COMMENT 'spu 版本',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `spu_number` (`spu_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SPU表';

CREATE TABLE `spu_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `spu_number` varchar(50) NOT NULL COMMENT 'SPU编',
  `entity` text COMMENT '实体JSON',
  `updated_by` bigint(20) NOT NULL COMMENT '用户id',
  `version` int(11) NOT NULL DEFAULT '1' COMMENT 'spu 版本',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_spu_number_created_at` (`spu_number`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SPU修改历史表';