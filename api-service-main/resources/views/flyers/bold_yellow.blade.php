<!DOCTYPE html>
<html lang="en">
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <title>bold_yellow.pdf</title>
        <style type="text/css">
            @page {
                margin: 0;
            }

            body {
               font-family: 'Barlow Condensed', sans-serif;
            }

            .arrow-box {
                background-color: #000000;
                position: relative;
                width: 316px; /* Adjust the width as needed */
                text-align: center;
            }
            .arrow-right {
                position: absolute;
                width: 0; 
                height: 0; 
                border-top: 72px solid transparent;
                border-bottom: 72px solid transparent;
                border-left: 90px solid rgb(0, 0, 0);
                right: 370px;
                top:538px;
            }
            .qr_code{
                position: absolute;
                right: 200px;
                top:528px;
            }


            /* Create the arrow using borders */
    
        </style>
    </head>
    <body style="padding:20px;">
        <div style="padding-top: 30px;padding-left: 22px; background-color:#EDE937 !important; height:69%;">
            <div style="font-size:140px;font-weight: 900;margin-top: -10px; line-height:92px; letter-spacing:0px;">
              <div style="display:inline-flex; !important; width:900px;"> 
                <div style="display:inline">YOUR</div>
                <div style="display:inline !important; margin-left:-30px;">
                    <div style="display:inline !important;">RA</div>
                    <div style="display:inline !important; margin-left:-40px;">TES</div>
                </div>
                
              </div>
                
               <div style="display:flex;"><div style="display:inline; letter-spacing:-10px !important;">& &nbsp;PAY</div><div style="display:inline; margin-left:11px !important;">MENTS</div></div>
               ARE ONE <br>
                <div style="display:flex !important;">
                    <div style="display:inline;">CLICK</div>&nbsp;<div style="letter-spacing:-10px; display:inline;">AWAY.</div>
                </div>
            </div>

            @php
                $fontSize = '26px';
                $paddingSize = '8px';
                $marginTop = '43px';
                $fontSizeProfile = '18px';
                
                if (Str::length($property['address']) > 22) {
                    $fontSize = '14px';
                    $paddingSize = '19px';
                    $marginTop = '41px';
                }
                if($company['housing'] == 'equal_housing_lender'){
                    $housing = 'house_lender_black.png';
                }else{
                    $housing = 'house_opportunity_black.png';
                }

                if (Str::length($loan_officer['email']) > 36) {
                    $fontSizeProfile = '16px';
                }

            @endphp
              <div class="arrow-box" style=" padding:{{$paddingSize}}; margin-top:{{$marginTop}};">
                <p style="color: #ffffff; font-size:{{$fontSize}}; font-weight:600; padding:0px; margin:13px;"> {{$property['address']}}</p>
              </div>
                 <div class="arrow-right"></div> 
                  <img
                    src="{{ $qr_image }}"
                    class="qr_code"
                    width="160"
                    style="margin-left: -18px;"
                   />
              <div style="  
                position: absolute;
                right: 42px;
                top:547px;">
                    <div> 
                        <p style="font-weight: 900; font-size:21px;">READY TO SAVE?</p>
                    </div>
                    <div> 
                        <div style="margin-top: 3px; font-weight: 900; font-size:25px; line-height:18px;">SCAN CODE FOR <br>LIVE RATES.</div>
                    </div>
              </div>
               <div style="font-weight: 900; font-size:34px !important; margin-top:25px;">NO PERSONAL INFO REQUIRED.</div>
        </div>
        <div style="margin-top: 30px; margin-left:20px; display:flex;">
            <div style="display: inline-block;vertical-align: top;  margin-top:12px;">
                <img
                    src="{{ $loan_officer['profile_picture'] }}"
                    width="120"
                    style="width: auto;height: auto; max-width: 120px;top: 50%;left: 50%; margin-right:0px;right:0;max-height: 105px;"
                />
            </div>
            <div style="display: inline-block;vertical-align: top;">
                <div style="display: inline-block;vertical-align: top;margin-left: 10px;font-size: {{ $fontSizeProfile }};font-weight: 900;width: 488px;">
                    <div style="margin-bottom:-5px;">
                        {{ $loan_officer['name'] }}
                    </div>
                    <div style="margin-bottom:-5px;">
                        {{ $loan_officer['job_title'] }}
                    </div>
                    <div style="margin-bottom:-5px;">
                        {{ $loan_officer['email'] }}
                    </div>
                    <div style="margin-bottom:-5px;">
                            {{ $loan_officer['mobile_number'] }}
                    </div>
                            NMLS# {{ $loan_officer['nmls_number'] }}
                    </div>
                </div>
            </div>
            <div>
                <img
                 style="display: flex-end; 
                    position: absolute; 
                    max-width: 175px;
                    max-height: 110px;
                    top:50%;
                    left:50%;
                    transform: translate(-50%, -50%);
                    width: auto;
                    height: auto; left:472; top:650;"
                src="{{ $company['logo'] }}"
                />
            </div>
        </div>
        <footer style="background-color:#EDE937 !important;color: #000000;padding: 20px;padding-top: 20px; padding-bottom: 20px !important;margin-top: -1px;position: absolute;bottom: 15; left: 15; right: 15; height: 70px; padding-right:15px;">
            <div style="text-align: left;position: absolute;bottom: 45px; z-index: 99;padding-bottom: 9px;">
                <div style="display: inline-block;vertical-align: text-top !important; text-align: left;width: 514px;font-size: 10px;margin-left: 10px; font-weight:500;">
                    {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
                </div>
                <div style="display: inline-block;vertical-align: bottom;margin-bottom: -29px;margin-left: 105px;">
                    <div class="sml-images">
                        <p style="font-size: 8px; font-weight: normal; margin-top:45px; margin-bottom:3px; margin-left:3px; font-family: serif">POWERED BY</p>
                        <img src="{{ config('uplist.flyer_assets_url') . '/uplist-logo-blk.png' }}" alt="" height="40"
                            style="margin-top: 70px; display: block; margin: auto;" height="30"/>
                        <br style="margin:20px;margin-bottom:50px; width:30px;">
                    </div>
                </div>
                <img 
                    style="margin-right:-21px !important; position: absolute; bottom:16; right:-10;"
                    src="{{ config('uplist.flyer_assets_url') . '/'.$housing }}" width="35"/>
            </div>
        </footer>
    </body>
</html>
