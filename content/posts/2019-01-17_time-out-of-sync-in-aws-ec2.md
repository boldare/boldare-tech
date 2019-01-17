---
title: Time out-of-sync in AWS EC2
subTitle: How to let network time protocol do its job
tags: ["ntp", "networking", "aws", "ec2", "ubuntu"]
cover: /img/aws.png
postAuthor: Maciej Papież (@maciejpapiez)
---

## Issue

If your Ubuntu EC2 instance is located in a VPC with strong firewall policies (security
groups and network ACLs), then it can happen that it won't be able to synchronize
the time with NTP and timesyncd (https://help.ubuntu.com/lts/serverguide/NTP.html).

## What can you observe?

Just tail your `/var/log/syslog` and look for entries like below:

```
systemd-timesyncd[456]: Timed out waiting for reply from 91.189.91.157:123 (ntp.ubuntu.com).
```

## How to fix it?

The simplest solution is to leverage the
[AWS-provided NTP server](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html#configure-amazon-time-service-ubuntu)
that is always available, whatever the network ACLs and security group rules are.

Quote:
> The Amazon Time Sync Service is available through NTP at the 169.254.169.123 IP address for any instance running in a VPC. Your instance does not require access to the internet, and you do not have to configure your security group rules or your network ACL rules to allow access.

Just run the following command manually or as a part of your user data script:
```
sed -i 's/#NTP=/NTP=169.254.169.123/' /etc/systemd/timesyncd.conf
```

# Alternative

A more complex alternative is to open UDP traffic on port 123 in your network ACLs and security groups. Haven't tried that - if you do, don't hesitate to edit the post!

## Did it help?

Let me know via [Twitter](https://twitter.com/maciejpapiez)!
