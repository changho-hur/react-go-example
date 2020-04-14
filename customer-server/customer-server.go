package main

import (
	"database/sql"
	"log"
	"net/http"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gin-gonic/gin"
)

var db *sql.DB

type Customer struct {
	Id        int    `json:"id"`
	Name string `json:"name" form:"name" binding:"required"`
	Job  string `json:"job" form:"job"`
	BirthDay  string `json:"birthday" form:"birthday"`
	Gender string `json:"gender" form:"gender"`
	Image string `json:"image" form:"fileName"`
	File string `json:"file" form:"file"`
}

func main() {

	db, _ = sql.Open("mysql", "https://github.com/go-sql-driver/mysql#examples") // 접속 정보 등 외부 파일로 빼보자.
	defer db.Close()

	router := gin.Default()
	router.Use(CORSMiddleware())
	router.GET("/ping", pingHandler)

	cust := router.Group("/customer")
	{
		cust.GET("/list", listEndpoint)
		cust.POST("", addEndpoint)
		cust.DELETE("/:customerId", deleteEndpoint)
	}
	router.Run()
}

func deleteEndpoint(c *gin.Context) {
	log.Print("[deleteEndpoint] START")
	customerId, _ := c.Params.Get("customerId")
	log.Print("[deleteEndpoint] id= ", customerId)
	result, _ := db.Exec("UPDATE CUSTOMER SET isDeleted = 'Y' where id = ?", customerId)
	row, _ := result.RowsAffected()
	log.Print("[deleteEndpoint]", row, "data deleted.")
	c.Status(http.StatusOK)
	log.Print("[deleteEndpoint] END")
}

func addEndpoint(c *gin.Context) {
	log.Print("[addEndpoint] START")

	var customer Customer
	err := c.Bind(&customer)
	if err != nil {
		log.Print("parameter bind error [", err,"]")
		c.Status(http.StatusBadRequest)
		return
	}

	log.Print(customer)

	c.Status(http.StatusOK)
	log.Print("[addEndpoint] END")
}

func listEndpoint(c *gin.Context) {
	log.Print("[listEndpoint] START")
	rows, err := db.Query("SELECT id, image, name, birthday, job, gender FROM CUSTOMER where isDeleted != 'Y'")
	log.Print("[listEndpoint] Query Excute")
	if err != nil {
		log.Print("[listEndpoint] Query ERROR: ", err.Error())
		return
	}
	defer rows.Close()
	var customers []Customer
	for rows.Next() {
		var customer Customer
		rows.Scan(&customer.Id, &customer.Image, &customer.Name, &customer.BirthDay, &customer.Job, &customer.Gender)
		customers = append(customers, customer)
	}
	c.JSON(http.StatusOK, gin.H{"result": customers})
	log.Print("[listEndpoint] END")
}

func pingHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context){
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
		c.Header("Access-Control-Allow-Methods", "GET, DELETE, POST")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
