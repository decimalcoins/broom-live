-- Seed default gifts
INSERT INTO gifts (id, name, coin_cost, image_url, animation_url)
VALUES 
    ('gift_1', 'Heart', 100, '/gifts/heart.png', '/gifts/heart-anim.json'),
    ('gift_2', 'Rose', 500, '/gifts/rose.png', '/gifts/rose-anim.json'),
    ('gift_3', 'Diamond', 1000, '/gifts/diamond.png', '/gifts/diamond-anim.json'),
    ('gift_4', 'Crown', 5000, '/gifts/crown.png', '/gifts/crown-anim.json'),
    ('gift_5', 'Rocket', 10000, '/gifts/rocket.png', '/gifts/rocket-anim.json')
ON CONFLICT (id) DO NOTHING;
