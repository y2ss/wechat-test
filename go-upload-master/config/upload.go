package config

import "go-upload-master/uploader"

var Upload uploader.TConfig

func InitUpload() {
	Upload = Config.Upload
}
