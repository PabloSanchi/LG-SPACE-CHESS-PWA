import React, { useState, useEffect, useRef, useMemo } from 'react'
import { VStack, Button, Flex } from '@chakra-ui/react';

import { Map, Marker, ZoomControl } from "pigeon-maps"

const satellite = require('satellite.js');

function DisplaySat() {

    // useEffect(() => {
    //     (async function init() {
    //         delete L.Icon.Default.prototype._getIconUrl;

    //         L.Icon.Default.mergeOptions({
    //             iconRetinaUrl: iconRetinaUrl.src,
    //             iconUrl: iconUrl.src,
    //             shadowUrl: shadowUrl.src,
    //         });
    //     })();
    // }, []);

    const [loaded, setLoaded] = useState(false);
    const [info, setInfo] = useState('loading...');
    const [coord, setCoord] = useState([51.505, -0.09]);
    const [focusCenter, setFocusCenter] = useState([51.505, -0.09]);
    const [follow, setFollow] = useState(true);

    const tleLine1 = '1 51080U 22002DA  22200.13694574  .00008725  00000+0  44414-3 0  9996';
    const tleLine2 = '2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660';
    const MAPTILER_ACCESS_TOKEN = 'SnjwKQpOHvLSvRXmRQ8Q';
    const MAPID = 'streets'

    useEffect(() => {
        // console.log('loading...');
        let coords = getLatLongFromTle();
        setCoord(coords);
        setFocusCenter(coords);
        setInfo(`[lat, lng]: ${coords[0]}, ${coords[1]}`);
        setLoaded(true);
        console.log(coord);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getCoords();
        }, 2000);
        return () => clearInterval(interval);
    });

    function getCoords() {
        let coords = getLatLongFromTle();
        setCoord(coords);
        if (follow) setFocusCenter(coords);
        setInfo(`[lat, lng]: ${coords[0]}, ${coords[1]}`);
    }

    function getLatLongFromTle() {
        // Initialize a satellite record
        var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

        //  Propagate satellite using time since epoch (in minutes).
        let timestamp = new Date().getTime();
        let hours = Math.floor(timestamp / 60 / 60);
        let timeSinceTleEpochMinutes = Math.floor(timestamp / 60);
        var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);

        //  Or you can use a JavaScript Date
        var positionAndVelocity = satellite.propagate(satrec, new Date());

        // The position_velocity result is a key-value pair of ECI coordinates.
        // These are the base results from which all other coordinates are derived.
        var positionEci = positionAndVelocity.position,
            velocityEci = positionAndVelocity.velocity;

        // Set the Observer at 122.03 West by 36.96 North, in RADIANS
        var observerGd = {
            longitude: satellite.degreesToRadians(-122.0308),
            latitude: satellite.degreesToRadians(36.9613422),
            height: 0.370
        };

        // You will need GMST for some of the coordinate transforms.
        // http://en.wikipedia.org/wiki/Sidereal_time#Definition
        var gmst = satellite.gstime(new Date());

        // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
        var positionEcf = satellite.eciToEcf(positionEci, gmst),
            observerEcf = satellite.geodeticToEcf(observerGd),
            positionGd = satellite.eciToGeodetic(positionEci, gmst),
            lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

        // The coordinates are all stored in key-value pairs.
        // ECI and ECF are accessed by `x`, `y`, `z` properties.
        var satelliteX = positionEci.x,
            satelliteY = positionEci.y,
            satelliteZ = positionEci.z;

        // Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
        var azimuth = lookAngles.azimuth,
            elevation = lookAngles.elevation,
            rangeSat = lookAngles.rangeSat;

        // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
        var longitude = positionGd.longitude,
            latitude = positionGd.latitude,
            height = positionGd.height;

        //  Convert the RADIANS to DEGREES.
        var longitudeDeg = satellite.degreesLong(longitude),
            latitudeDeg = satellite.degreesLat(latitude);

        return [latitudeDeg, longitudeDeg];
    }

    function ChangeView({ center }) {
        // const map = useMap();
        // if (follow) map.setView(center);
    }


    function mapTiler(x, y, z, dpr) {
        return `https://api.maptiler.com/maps/${MAPID}/256/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.png?key=${MAPTILER_ACCESS_TOKEN}`
    }


    return (
        <VStack display="fix">
            {true &&
                // <Flex display="fix" justify="center">
                <Flex>
                    <Button position="absolute" zIndex="popover" right="0.5" ml={2} colorScheme="blue" onClick={() => setFollow(!follow)}>{!follow ? 'Track' : 'Untrack'}</Button>
                    <Map provider={mapTiler}
                        dprs={[1, 2]}
                        height={window.innerHeight - 130}
                        boxClassname="myPigeonMap"
                        defaultCenter={[50, 20]}
                        center={focusCenter}
                        defaultZoom={3}
                        scrollWheelZoom={false}
                        metaWheelZoom={true}
                        limitBounds="edge"
                        minZoom={3}
                    >
                        <ZoomControl />
                        <Marker
                            color={`hsl(${120 % 360}deg 39% 70%)`}
                            width={50}
                            anchor={coord}
                        />
                    </Map>
                </Flex>
            }
        </VStack>
    )
}

export default DisplaySat
