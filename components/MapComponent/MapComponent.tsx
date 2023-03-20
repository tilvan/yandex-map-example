import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { YMaps, useYMaps } from '@pbe/react-yandex-maps';
import tasksList from './data/tasks.json';
import styles from './MapComponent.module.css';

const MapWithObjectManager: React.FC<any> = () => {
  const mapRef = useRef(null);
  const ymaps = useYMaps(['Map', 'ObjectManager']);
  const [mapInstance, setMapInstance] = useState(undefined);
  const [objectManager, setObjectManager] = useState(undefined);

  const [mapItemsOriginal, setMapItemsOriginal] = useState([]);
  const [mapItems, setMapItems] = useState([]);

  useEffect(() => {
    const nextMapItems = tasksList.reduce((acc, item) => {
      if (!item.geoLat || !item.geoLon) {
        return;
      }

      const coordinates = [item.geoLat, item.geoLon];
      const duplicatedItemIndex = acc.findIndex(
        item => item.geoLat === coordinates[0] && item.geoLon === coordinates[1]
      );

      if (duplicatedItemIndex > -1) {
        acc[duplicatedItemIndex]?.listId?.push(item.id);
      } else {
        acc.push({
          id: item.id,
          name: item.name,
          geoLat: item.geoLat,
          geoLon: item.geoLon,
          listId: [item.id],
        });
      }

      return acc;
    }, []);

    setMapItems(nextMapItems);
    setMapItemsOriginal(nextMapItems);
  }, [tasksList]);

  useEffect(() => {
    if (!ymaps || !mapRef.current) {
      return;
    }

    const map = new ymaps.Map(mapRef.current, {
      center: [53.3027634, 34.2950038],
      zoom: 15,
    });

    const nextObjectManager = new ymaps.ObjectManager({
      clusterize: true,
      gridSize: 32,
    });

    setMapInstance(map);
    setObjectManager(nextObjectManager);
  }, [ymaps]);

  useEffect(() => {
    if (!mapInstance || !objectManager) {
      return;
    }

    mapInstance.geoObjects.add(objectManager);
  }, [mapInstance, objectManager]);

  const objectManagerFeatures = useMemo(() => {
    let currentId = 0;

    const nextFeatures = mapItems.reduce((acc, item) => {
      const coordinates = [item.geoLat, item.geoLon];

      acc.push({
        type: 'Feature',
        id: currentId++,
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {
          openBalloonOnClick: false,
          hintContent: item.name,
        },
      });

      return acc;
    }, []);

    return {
      type: "FeatureCollection",
      features: nextFeatures,
    }
  }, [mapItems]);

  const toggleMapFeatures = useCallback(() => {
    const mapItemIndex = Math.floor(Math.random() * 15);
    const nextMapItems = mapItemsOriginal.filter((item, index) => index === mapItemIndex);

    setMapItems(nextMapItems);

    if (mapInstance) {
      const selectedItem = mapItemsOriginal[mapItemIndex]
      const nextCenterCoords = [selectedItem.geoLat, selectedItem.geoLon];

      mapInstance.setZoom(16);
      mapInstance.panTo(nextCenterCoords, { flying: true, delay: 100, duration: 300, checkZoomRange: false });
    }
  }, [mapInstance]);

  useEffect(() => {
    if (!objectManager || !objectManagerFeatures || !ymaps || !mapRef.current) {
      return;
    }

    objectManager.removeAll();
    objectManager.add(objectManagerFeatures);
  }, [objectManager, objectManagerFeatures, ymaps, mapRef]);

  return (
    <>
      <div className={styles.actions}>
        <button className={styles.action} onClick={toggleMapFeatures}>Toggle</button>
      </div>

      <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
    </>
  );
};

const MapComponent: React.FC = () => {
  return (
    <YMaps>
      <MapWithObjectManager />
    </YMaps>
  );
};

export default MapComponent;