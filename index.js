const projectName = 'heatmap-Graph';

/*Here we're going to get the dataset to use on our datachart */
//Here is our data URL;

            
const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const colors =[
  "#300066",
  "#030066",
  "#004466",
  "#0fa3a3",
  "#ffffbf",
  "#fff75e",
   "#ffbf5e",
   "#e6932e",
   "#e66e2e",
   "#e62e2e"
]


// This will fetch the data as soon as the the document load;

async function getData(url){
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

//Function that generates an array with the range of the colors in our map;
  async function legendRange(step,lowT,baseT){
  let rangeArray = [];
  let e = 0;
  let objSize = Object.keys(colors).length;
  for(let i=0;i<objSize;i++){
    e = baseT + lowT + i*step;
    e = Math.round(e*1000)/1000
    rangeArray.push(e);
  }
  return rangeArray;
};

async function main(){
  // Getting data
  
  let data = await getData(dataURL);
  
  // setting up width, height and padding
  
  const w = 1200;
  const h = 560;
  const p = 35;
  
  // starting the svg 
  
  const svg = d3.select("#heat-map")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("id", "heat-map-area");
  
  //starting the svg legend
  
  const legend= d3.select("#legend-container")
                  .append("svg")
                  .attr("width", 500)
                  .attr("height", 250)
                  .attr("id", "legend");
  //Starting the svg tooltip
  var tooltip = d3.select("#heat-map").append("div")
                    .attr("class", "tooltip-class")
                    .attr("id", "tooltip")
                    .style("opacity", 0)
  
  // setting x and y scales
  // in the x-axis we're plotting the years and in the y-axis the month 
  let firstYear = d3.min(data.monthlyVariance, (d)=> d.year); 
  let lastYear = d3.max(data.monthlyVariance, (d)=>d.year);

  const yScale = d3.scaleLinear()
                   .domain([0.5,12])
                   .range([h-p,p]);
  
  const xScale = d3.scaleLinear()
                   .domain([firstYear,lastYear])
                   .range([p,w-p]);
  
  //Creating the heating cells
  //calculating bar width and bar Height;
  
  let barW = (w-2*p)/(lastYear-firstYear);
  barW = ~~(barW*100)/100;
  let barH = (h-2*p+20)/(12);
  
  // Calculating the range of the temperature variance
  // And setting the scale of the color variance
  let maxVar = d3.max(data.monthlyVariance, (d)=> d.variance);
  let minVar = d3.min(data.monthlyVariance, (d)=> d.variance);
  let step = Math.round((maxVar-minVar)*10000/10)/10000;
  
  //Setting the legendScale
  let rangeArray = await legendRange(step,minVar,data.baseTemperature);
  let legendScale = d3.scaleLinear()
                      .domain([0.5,12])
                      .range([20,370]);
  
  console.log(rangeArray);
  svg.selectAll("rect")
     .data(data.monthlyVariance)
     .enter()
     .append("rect")
     .attr("x", (d)=> xScale(d.year)+62)
     .attr("y", (d)=> yScale(d.month)-20)
     .attr("width", barW)
     .attr("height", barH)
     .attr("fill", function(d){
           if(d.variance <=Math.round((minVar+step)*1000)/1000) return colors[0];
           if(d.variance <=Math.round((minVar+2*step)*1000)/1000) return colors[1];
           if(d.variance <=Math.round((minVar+3*step)*1000)/1000) return colors[2];
           if(d.variance <=Math.round((minVar+4*step)*1000)/1000) return colors[3];
           if(d.variance <=Math.round((minVar+5*step)*1000)/1000) return colors[4];
           if(d.variance <=Math.round((minVar+6*step)*1000)/1000) return colors[5];
           if(d.variance <=Math.round((minVar+7*step)*1000)/1000) return colors[6];
           if(d.variance <=Math.round((minVar+8*step)*1000)/1000) return colors[7];
           if(d.variance <=Math.round((minVar+9*step)*1000)/1000) return colors[8];
           if(d.variance <=Math.round((minVar+10*step)*1000)/1000) return colors[9];    
  })
     .attr("class", "cell")
     .attr("data-month", (d)=>d.month-1)
     .attr("data-year", (d)=>d.year)
     .attr("data-temp", (d)=>data.baseTemperature + d.variance)
     .on("mouseover", (event,d)=>{
      tooltip.attr("data-year", d.year)
      tooltip.attr("temperature", data.baseTemperature + d.variance)
      tooltip.style("left", event.pageX +15+ "px")
      .style("top", event.pageY+ "px")
      tooltip.transition()
      .duration(200)
      .style("opacity", 0.9)
      .style("background-color","black")
      .style("color", "white")
      tooltip.html("<p> Year: " + d.year + " - "+
                   d.month.toString(10).replace("12", "December")
                         .replace("11", "November")
                         .replace("10", "October")  
                         .replace("9", "September")
                         .replace("8", "August")
                         .replace("7", "July")
                         .replace("6", "June")
                         .replace("5", "May")
                         .replace("4", "April")
                         .replace("3", "March")
                         .replace("2", "February")
                         .replace("1", "January")
                         .replace("0", "")
                   +"</br>"
                   +(Math.round((data.baseTemperature + d.variance)*100)/100)+"ºC </p>")
  })
    .on("mouseout", ()=>{
    tooltip.transition()
    .duration(200)
    .style("opacity",0)
  })
  //calling the x and y axis
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  svg.append("g")
     .attr("id", "x-axis")
     .attr("transform","translate(62,"+(h-p)+")")
     .call(xAxis);
  const yAxis = 
        d3.axisLeft(yScale).tickFormat(function(d){
          let num = d.toString(10);
          let label = num.replace("12", "December")
                         .replace("11", "November")
                         .replace("10", "October")  
                         .replace("9", "September")
                         .replace("8", "August")
                         .replace("7", "July")
                         .replace("6", "June")
                         .replace("5", "May")
                         .replace("4", "April")
                         .replace("3", "March")
                         .replace("2", "February")
                         .replace("1", "January")
                         .replace("0", "")
          return label;
        });

  
     svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate("+(p+62)+",0)")
        .call(yAxis.ticks(13));
    //creating legend axis;
    legend.selectAll("rect")
          .data(rangeArray)
          .enter()
          .append("rect")
          .attr("x", (d,i)=> 10+i*35)
          .attr("y",40)
          .attr("height", 35)
          .attr("width", 35)
          .attr("fill",function(d,i){
           return colors[i]
    })
    const legAxis = d3.axisBottom(legendScale).tickFormat(d3.format("d"));
    legend.append("g")
    .attr("id","legend-axis")
    .attr("transform", "translate(-11"+","+76+")")
    .call(legAxis.ticks(7));
  
} 

main();