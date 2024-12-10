import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

function Map(props) {
  const DEFAULT_WIDTH = 600;
  const DEFAULT_HEIGHT = 600;
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = props;

  return (
    <div className='w-full h-full'>
      <DynamicMap {...props} />
    </div>
  )
}

export default Map;