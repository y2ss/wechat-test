package http

import (
	"github.com/gin-gonic/gin"
	"go-upload-master/config"
	"go-upload-master/uploader"
	"github.com/itsjamie/gin-cors"
	"log"
	"time"
)

var (
	Router *gin.Engine
)

func RunServer() (err error) {
	gin.SetMode(config.Config.Mode)
	Router = gin.Default()
	Router.Use(gin.Logger())
	Router.Use(gin.Recovery())

	Router.Use(cors.Middleware(cors.Config{
		Origins:         "*",
		Methods:         "GET, PUT, POST, DELETE, OPTIONS",
		RequestHeaders:  "Origin, X-Requested-With, X_Requested_With, Content-Type, Accept, Authentication, Authorization, X-Server, X-Password-Pay",
		ExposedHeaders:  "",
		MaxAge:          60 * time.Second,
		Credentials:     true,		// cookies
		ValidateHeaders: false,
	}))

	if loader, err := uploader.New(Router, config.Config.Upload); err != nil {
		log.Print(err)
		return err
	} else {
		loader.Resolve()
	}

	return Router.Run(config.Http.Host + ":" + config.Http.Port)
}
