//var apikey = "fb45e7a7f88327f766cc23cb0ef2def7:14:70022208";
			var totalarticles = [];
			var year;
			function setup(){
				var c = document.getElementById("myCanvas");
				c.width  = window.innerWidth;
				c.height  = window.innerHeight - 80;
				var ctx = c.getContext("2d");
				drawAxes(ctx, c.width, c.height);
			}

			function findImages(){
				$('#myCanvas').unbind("click");

				var images = [];
				document.getElementById('mydiv').innerHTML = "";

				var search = document.getElementById("search_field").value;
				search = search.replace(' ', '+');
				year = document.getElementById("year_field").value;
				var imgstring;
				var art_url;
				var c = document.getElementById("myCanvas");
				c.width  = window.innerWidth;
				c.height  = window.innerHeight - 75;
				var ctx = c.getContext("2d");
				ctx.clearRect(0,0,c.width,c.height);
				drawAxes(ctx, c.width, c.height);
				var articles = [];
				while(articles.length > 0) {
					articles.pop();
				}
				var articles2 = [];
				while(articles2.length > 0) {
					articles2.pop();
				}
				

				var acount = 0;
				var articles2 = [];

				var articles = [];
				articles = buildArticles(articles, articles2, search, 0, c, ctx);	
				
				console.log("a: " + totalarticles);
				
				$('#myCanvas').click(function (e) {
					var clickedX = e.pageX - this.offsetLeft;
					var clickedY = e.pageY - this.offsetTop;
					for(var al = 0; al < totalarticles.length; al++){
						if (clickedX > totalarticles[al].tlcoors[0] && clickedX < totalarticles[al].tlcoors[2] && clickedY < totalarticles[al].tlcoors[3] && clickedY > totalarticles[al].tlcoors[1]){
			    		window.open(totalarticles[al].url);
			    	}
			    }

			    
			});
				
				
			}

			function Article(date, headline, url, imgurl, texts){
				this.year=date.split("-")[0];
				this.month=date.split("-")[1];
				this.day=date.split("-")[2].substring(0,2);
				this.headline=headline;
				this.url = url;
				this.imgurl = imgurl;
				this.tlcoors = [];
				this.senscore = 0;
				this.texts = texts;
			}

			function sortByUpdated(array, key) {
				return array.sort(function(a, b) {
					var x = a.pub_date;
					var y = b.pub_date;
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				});
			}

			function drawAxes(ctx, w, h){
				ctx.moveTo(10,10);
				ctx.lineTo(10,h-10);
				ctx.stroke();
				ctx.moveTo(10,h/2);
				ctx.lineTo(w-10,h/2);
				ctx.stroke();
				ctx.moveTo(10,h-10);
				ctx.lineTo(w-10,h-10);
				ctx.stroke();
				/*var nh;
				for (var v = 0; v < 18; v+=2){
					if (v == 8){
						continue;
					}
					v = 8 - v;
					nh = -1;
					for (var u = 0; u <= v; u++ ){
						nh += .1000000000000000000000;
					}
					ctx.moveTo(10, (h/2*nh)+(h/2));
					ctx.lineTo(20, (h/2*nh)+(h/2));
					ctx.stroke();
					ctx.fillText("0."+v ,25, (h/2*nh)+(h/2));
				}*/
				ctx.font="10px Georgia";

				var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				for (var m = 0; m < 12; m++){
					ctx.moveTo(10+((w-10)/12)*m,h-10);
					ctx.lineTo(10+((w-10)/12)*m,h-20);
					ctx.stroke();
					ctx.fillText(months[m],((w-10)/12)*m,h-30);
				}
			}

			//"&page=" + p +
			//findImages();
			function analyze(aj, articles, c, ctx){
				
				$.ajax({
					type: 'POST',
					url: "https://twinword-sentiment-analysis.p.mashape.com/analyze/",
					data: "text="+articles[aj].texts,
					headers: {
						"X-Mashape-Key": "SFtbVbITO1msha4G6f3IqAJlY8sEp1pnElMjsnmfmB6w3alR0r",
						"Content-Type": "application/x-www-form-urlencoded"
					}

				}).done(function(data) {
					//console.log(articles[aj].headline + " " + data);
					data = JSON.parse(data);
			console.log(data.score);
			articles[aj].senscore = parseFloat(data.score);
			//console.log(articles[aj].senscore);
		    //alert("headline: "+ articles[1].headline + " score: " + articles[1].senscore);
		    aj++;
		    if (aj < articles.length-1){

		    	
		    	articles = drawArticle(articles, c, ctx, aj-1);
		    	articles = analyze(aj, articles, c, ctx);
		    }
		    return articles;

		    
		});
				return articles;
			}

			function drawArticle(articles, c, ctx, aj2){
				//alert("drawArticles running");
				
				var image2 = new Image;
				image2.src = articles[aj2].imgurl;
				var maxw = Math.floor(c.width/150);
				var xval = 20+((c.width/12)*(articles[aj2].month -1))+((c.width/365)*(articles[aj2].day -1));
				var yval = (c.height/2)-(c.height*(articles[aj2].senscore));
				if (yval > c.height-80){
					yval = c.height-80;
				}
				if (yval < 50){
					yval = 50;
				}
				ctx.drawImage(image2, xval, yval);
				//ctx.rect(xval,yval,75,75);

				//ctx.lineWidth = 2;
				//ctx.stroke();

				//console.log(articles[aj2].year);
				//console.log(articles[aj2].month);
				//console.log(articles[aj2].day);

				

				articles[aj2].tlcoors = [xval, yval, xval+200, yval+125];


				return articles;
			}

			function buildArticles(articles, articles2, search, montha, c, ctx){
				var articles2 = [];
				var acount = 0;
				var y = [articles, articles2];
				
				monthb = montha+1;
				if (monthb<10){
					monthb = "0"+monthb;
				}
				//console.log(montha);

				$.get("http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + search + "&fq=document_type%3A%28%22article%22%29+&begin_date=" + year + monthb + "01&end_date=" +  year + monthb + "31&api-key=fb45e7a7f88327f766cc23cb0ef2def7:14:70022208", function(data){
						//console.log(data);
						//var results = http://api.nytimes.com/svc/search/v2/articlesearch.json?q=romney&api-key=fb45e7a7f88327f766cc23cb0ef2def7:14:70022208
						articles2 = articles2.concat(data.response.docs);
						//console.log(articles2.length);
						//console.log(articles2);

					for (var a = 0; a < articles2.length-1; a++){
						
						if (articles2[a].multimedia.length > 0){
							tempa = articles2[a];
							if (tempa != null && tempa.multimedia[2] != undefined){
								tempart = new Article(tempa.pub_date, tempa.headline.main, tempa.web_url, ("http://www.nytimes.com/" + tempa.multimedia[2].url), (tempa.lead_paragraph + " " + tempa.abstract));
							articles.push(tempart);
							acount++;
							}
							if (acount>2){
								break;
							}
						}
					}
						
					})
					.done(function() {
					//console.log("done: " + articles2);
						montha++;
						if (montha == 1){
							articles = buildArticles(articles, articles2, search, montha, c, ctx);
						}
						if (montha < 10 && montha >1){

					articles = buildArticles(articles, articles2, search, montha, c, ctx);
					return articles;
				}
				
				
				if (montha == 10){
					//console.log("now out of get: " +  articles);
					articles = analyze(0, articles, c, ctx);
					console.log(articles);
					totalarticles = articles;
					return articles;
				$('#myCanvas').click(function (e) {
					//console.log("on click: " + articles);
					var clickedX = e.pageX - this.offsetLeft;
					var clickedY = e.pageY - this.offsetTop;
					for(var al = 0; al < articles.length; al++){
						if (clickedX > articles[al].tlcoors[0] && clickedX < articles[al].tlcoors[2] && clickedY < articles[al].tlcoors[3] && clickedY > articles[al].tlcoors[1]){
			    		console.log(articles[al].headline);
			    		window.open(articles[al].url);
			    	}
			    }

			    
			});
					
				}});
				
				//return articles;
				
			}
