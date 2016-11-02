		export function getDecade(season){
            var a = season.split("–");
            var yy1 = Number(a[0]);
            var yy2 = Number(a[1]);
            var s = "1800s";

                // if (yy1 >= 1960 && yy2 <= 1970){ s = ['1960s', 1]}
                if (yy1 >= 1880 && yy2 <= 1890){ s = '1880s'}
                if (yy1 >= 1890 && yy2 <= 1900){ s = '1890s'}
                if (yy1 >= 1900 && yy2 <= 1910){ s = '1900s'}
                if (yy1 >= 1910 && yy2 <= 1920){ s = '1910s'}
                if (yy1 >= 1920 && yy2 <= 1930){ s = '1920s'}
                if (yy1 >= 1930 && yy2 <= 1940){ s = '1930s'}
                if (yy1 >= 1940 && yy2 <= 1950){ s = '1940s'}
                if (yy1 >= 1950 && yy2 <= 1960){ s = '1950s'}
                if (yy1 >= 1960 && yy2 <= 1970){ s = '1960s'}
               
                if (yy1 >= 1970 && yy2 <= 1980){ s = '1970s'}
                if (yy1 >= 1980 && yy2 <= 1990){ s = '1980s'}
                if (yy1 >= 1990 && yy2 <= 2000){ s = '1990s'}
                if (yy1 >= 2000 && yy2 <= 2010){ s = '2000s'}
                if (yy1 >= 2010 && yy2 <= 2020){ s = '2010s'}

            return s
        }

        export function getMonthNum(month){

            var n = 0;

	            if( month == "January"){ n=0 }
	            if( month == "February"){ n=1 }
	            if( month == "March"){ n=2 } 
	            if( month == "April"){ n=3 }
	            if( month == "May"){ n=4 }
	            if( month == "June"){ n=5 }
	            if( month == "July"){ n=6 }
	            if( month == "August"){ n=7 }
	            if( month == "September"){ n=8 }
	            if( month == "October"){ n=9 }
	            if( month == "November"){ n=10 }
	            if( month == "December"){ n=11 }

	            if (n.toString().length == 1) {
	                    n = "0" + n;
	                }    

            return n;

        }

        export function getMonthStr(n){

            var s;

	            if( n==0){ s = "January" }
	            if( n==1){ s = "February" }
	            if( n==2){ s = "March" } 
	            if( n==3){ s = "April" }
	            if( n==4){ s = "May" }
	            if( n==5){ s = "June" }
	            if( n==6){ s = "July" }
	            if( n==7){ s = "August" } 
	            if( n==8){ s = "September" }
	            if( n==9){ s = "October" }
	            if( n==8){ s = "November" }
	            if( n==9){ s = "December" }

            return s;

        }

        export function getDayNum(d){

            if (d.toString().length == 1) {
                    d = "0" + d;
                }    

            return d;

        }

        export function getSeason(d,arraySplitter){
            var dateArr = d.split(arraySplitter);
            var season;
            var month = dateArr[1];
            var yyyy = Number(dateArr[2]);


                if( month == "January" || month == "February" ||  month == "March" ||  month == "April" ||  month == "May" ||  month == "June" ){ season = (yyyy-1)+"–"+yyyy }
                if( month == "July" || month == "August" ||  month == "September" ||  month == "October" ||  month == "November" ||  month == "December" ){ season = yyyy+"–"+(yyyy+1) }

                if( month == "01" || month == "02" ||  month == "03" ||  month == "04" ||  month == "05" ||  month == "06" ){ season = (yyyy-1)+"–"+yyyy }
                if( month == "07" || month == "08" ||  month == "09" ||  month == "10" ||  month == "11" ||  month == "12" ){ season = yyyy+"–"+(yyyy+1) }

            return season;
        }
