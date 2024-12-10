import { Map, MapStyle, Marker, Popup } from '@maptiler/sdk';
import { useEffect, useState } from 'react';

export function MapTiler2() {
  const [isHover, setIsHover] = useState(false)
  const [hoverText, setHoverText] = useState('')

  useEffect(() => {
    const mapContainer = document.getElementById('my-container-div');

    if (mapContainer) {
      const map = new Map({
        container: mapContainer, // Map constructor accepts an HTMLElement or a string (ID)
        apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY,
        center: [-34.8474964, -7.1390735], // Starting position
        zoom: 12,
        style: MapStyle.OPENSTREETMAP
      });

      map.on('load', () => {
        // const marker = new Marker({
        //   color: '#FF0000',
        //   draggable: true,
        // }).setLngLat([-34.8474964, -7.1390735]).addTo(map);

        map.addSource('bairros', {
          'type': 'geojson',
          'data': 'https://api.maptiler.com/data/d0a45dfa-6e28-49a1-9f1b-0c19e9a78960/features.json?key=QKbTJZdA6lXljsicnOEI'
        })

        map.addLayer({
          id: 'polygons',
          type: 'fill',
          source: 'bairros',
          layout: {},
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'], // Pega o valor do atributo adicionado
              0, '#ede9d0',    // Cor para valor 0
              5, '#00bae2',    // Cor para valores baixos
              10, '#3a001e',   // Cor intermediária
              20, '#f03b20'    // Cor para valores altos
            ],
            'fill-opacity': 0.5
          }
        })

        map.addLayer({
          id: 'outline',
          type: 'line',
          source: 'bairros',
          layout: {},
          paint: {
            'line-color': '#000',
            'line-width': 2
          }
        })

        // map.on('click', 'polygons', function (e) {
        //   // new Popup()
        //   //   .setLngLat(e.lngLat)
        //   //   .setHTML(`<h3>Average age of </br> women at first marriage</h3><p>${e.features[0].properties.value}</p>`)
        //   //   .addTo(map);

        //   alert(e.features[0].properties.text + ': ' + e.features[0].properties.value);
        // });

        map.on('mouseenter', 'polygons', function (e) {
          map.getCanvas().style.cursor = 'pointer';
          setIsHover(true)
          setHoverText(`${e.features[0].properties.text}: ${e.features[0].properties.value}`)
        });

        map.on('mousemove', 'polygons', function (e) {
          if (e.features.length > 0) {
            map.getCanvas().style.cursor = 'pointer';
            setIsHover(true)
            setHoverText(`${e.features[0].properties.text}: ${e.features[0].properties.value}`)
          }
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'polygons', function (e) {
          map.getCanvas().style.cursor = '';
          setIsHover(false)
          setHoverText('')
        });

        // map.addControl(new choroplethLegendControl({
        //   layerId: 'countries',
        //   limits: limits,
        //   colorScale: colorScale,
        // }), 'bottom-left');

        // map.on('click', 'polygons', (e) => {
        //   new Popup()
        //     .setLngLat(e.lngLat)
        //     .setHTML("<span className='flex bg-primary text-white rounded-xl absolute top-10 right-10'>" + e.features[0].properties.text + "</span>")
        //     .addTo(map);
        // })
      })

      return () => map.remove();
    } else {
      console.error('Map container not found!');
    }
  }, []);


  return (
    <>
      {
        isHover &&
        <div className='flex w-full bg-primary text-white rounded-xl absolute top-10 right-48'>
          <span className='flex w-fit bg-white text-black rounded-xl absolute top-10 right-10 p-2 ring-2 ring-black'>{hoverText}</span>
        </div>
      }
      <div id='my-container-div' className=' w-[100%] h-[450px] '>
      </div>
      <div id="state-legend" className="legend">
        <h4>Qtd de incidências por bairro</h4>
        <div><span className='bg-[#ede9d0]'></span>0  - 5</div>
        <div><span className='bg-[#00bae2]'></span>5  - 10</div>
        <div><span className='bg-[#3a001e]'></span>10 - 20</div>
        <div><span className='bg-[#f03b20]'></span>20+</div>
      </div>
    </>
  )
}
