-- Seed default gifts
INSERT INTO gifts (id, name, coin_cost, image_url, animation_url)
VALUES 
    ('gift_1', 'Heart', 10, '/gifts/heart.png', '/gifts/heart-anim.json'),
    ('gift_2', 'Rose', 1, '/gifts/rose.png', '/gifts/rose-anim.json'),
    ('gift_3', 'Diamond', 5, '/gifts/diamond.png', '/gifts/diamond-anim.json'),
    ('gift_4', 'Crown', 500, '/gifts/crown.png', '/gifts/crown-anim.json'),
    ('gift_5', 'Rocket', 100, '/gifts/rocket.png', '/gifts/rocket-anim.json')
ON CONFLICT (id) DO NOTHING;
