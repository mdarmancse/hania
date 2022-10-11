import base64 from 'react-native-base64';
const username = 'exilog';
const password = "dWLF&%jn7PpEc2d";

export const fetchPlacesAutocomplete = (searchKeyword) => (firebase) => {
   // return new Promise((resolve,reject)=>{
        
        //  fetch(`http://197.112.4.247:4000/v1/search?text=${searchKeyword}&size=5`, {
        //      method: 'GET',
        //      headers: {
        //          'Content-Type': 'application/json',
        //      },
           
        //  }).then(response => {
        //      return response.json();
        //  })
        //  .then(json => {
            
 
        //      if(json && json.features) {
        //          let places=json.features.map((f)=>{return {
        //             lat:f.geometry.coordinates[1],
        //             lng:f.geometry.coordinates[0],
        //             description:f.properties.name    
        //         }})
                
        //          resolve(places);
 
        //      }else{
        //          reject(json.error);
        //      }
        //  }).catch(error=>{
        //      console.log(error);
        //      reject("fetchAddressfromCoords Call Error")
        //  })
     
 //});

   return new Promise((resolve,reject)=>{
        const { config } = firebase;
        fetch(`https://${config.projectId}.web.app/googleapis-autocomplete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Basic " + base64.encode(username + ":" + password)
            },
            body: JSON.stringify({
                "searchKeyword": searchKeyword
            })
        }).then(response => {
            return response.json();
        })
        .then(json => {
            console.log(json)
            if(json && json.searchResults) {
                resolve(json.searchResults);
            }else{
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("fetchPlacesAutocomplete Call Error")
        })
    });
   
}

export const fetchCoordsfromPlace = (place_id) => (firebase) => {
    return new Promise((resolve,reject)=>{
        //      resolve({lat:36,lng:3,description:"a"});
        //  return
        const { config } = firebase;
        fetch(`https://${config.projectId}.web.app/googleapis-getcoords`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Basic " + base64.encode(username + ":" + password)
            },
            body: JSON.stringify({
                "place_id": place_id
            })
        }).then(response => {
            return response.json();
        })
        .then(json => {
            if(json && json.coords) {
                resolve(json.coords);
            }else{
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("fetchCoordsfromPlace Call Error")
        })
    });
}


export const fetchAddressfromCoords = (latlng) => (firebase) => {
      
    return new Promise((resolve,reject)=>{
        
        const { config } = firebase;
        
       
       let latlngList= latlng.split(",")
       fetch(`http://141.95.162.190:5000/api/reverse/?lat=${latlngList[0]}&lon=${latlngList[1]}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
          
        }).then(response => {
            return response.json();
        })
        .then(json => {

            if(json && json.found) {
             
                resolve(json.name);

            }else{
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("fetchAddressfromCoords Call Error")
        })
    });



    //     fetch(`https://${config.projectId}.web.app/googleapis-getaddress`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             "Authorization": "Basic " + base64.encode(username + ":" + password)
    //         },
    //         body: JSON.stringify({
    //             "latlng": latlng
    //         })
    //     }).then(response => {
    //         return response.json();
    //     })
    //     .then(json => {
    //         if(json && json.address) {
    //             resolve(json.address);
    //         }else{
    //             reject(json.error);
    //         }
    //     }).catch(error=>{
    //         console.log(error);
    //         reject("fetchAddressfromCoords Call Error")
    //     })
    // });
}

export const getDistanceMatrix = (startLoc, destLoc) => (firebase) => {
    return new Promise((resolve,reject)=>{
        let latlngStart= startLoc.split(",")
        let latlngDist= destLoc.split(",")


        //return resolve([{found:true,timein_text:"5"}])
        body={
            "locations": [
                [latlngStart[1],latlngStart[0]],
                [latlngDist[1],latlngDist[0]]
            ],
            "sources": [0],
            "destinations": [1]
        }


        fetch(`http://141.95.162.190:8080/ors/v2/matrix/driving-car/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
          
            body: JSON.stringify(body)

        }).then(response => {
            return response.json();
        })
        .then(json => {
            if (json.hasOwnProperty('durations')) {
                resolve(
                   
                       json.durations.map(d=>{
                      return {found:true,timein_text:Math.ceil(d/60)+" min"}
                       })
                   
                );
            }else{
                console.log(json.error);
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("getDirectionsApi Call Error")
        })
    });
        

}

export const getDirectionsApi = (startLoc, destLoc, waypoints) => (firebase) => {
    let latlngStart= startLoc.split(",")
    let latlngDist= destLoc.split(",")
    let latLngWayPoints=[]

    if(waypoints){
        let firstSplit=waypoints.split('|')
        firstSplit.forEach(
            fs=>{
                latLngWayPoints.push(fs.split(","))
            }
        )
    }

    let coordinates=[ [
        latlngStart[1],
        latlngStart[0]
    ]]
    latLngWayPoints.forEach(
        p=>{
            coordinates.push(
                [
                    p[1],p[0]
                ]
            )  
        }    
    )
    coordinates.push(
           [ 
        latlngDist[1],
         latlngDist[0]]
    )

    return new Promise((resolve,reject)=>{
        const body ={
            coordinates:coordinates
        }
    
        fetch(`http://141.95.162.190:8080/ors/v2/directions/driving-car/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
          
            body: JSON.stringify(body)

        }).then(response => {
            return response.json();
        })
        .then(json => {
            if (json.hasOwnProperty('routes')) {
                resolve(
                   {
                    polylinePoints:json.routes[0].geometry,
                    distance_in_km:json.routes[0].summary.distance/1000,
                    time_in_secs:json.routes[0].summary.duration
                   }
                );
            }else{
                console.log(json.error);
                reject(json.error);
            }
        }).catch(error=>{
            console.log(error);
            reject("getDirectionsApi Call Error")
        })
    });
}

