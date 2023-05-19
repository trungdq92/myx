Gallerr
    1. Themes
        {
            id
            name
            des
            datetime
            thumbs
        }

        =>  Contents
                {
                    id
                    name
                    des
                    datetime
                    thumbs
                    hashtags => [animal,auto,building..] => Imgs => [1.jpg...]
                }

                

    2. Timeline
        {
            id
            datetime
            location
            event
            des
            thumbs
            hashtags => Imgs => [1.jpg...]
        }
        
       

Comics
    1. Group
        {
            id
            name
            des
            datetime
            thumbs
        }

        => Contents 
            {
                id
                name
                artist
                des
                datetime
                thumbs
                hashtags
            }

            => Chaps
                {
                    id
                    name
                    thumbs
                    -> Imgs
                }

                => Imgs => [1.jpg...]
